import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as _ from 'lodash';

@Injectable()
export class BusService {
  constructor(
    private readonly httpSvc: HttpService,
    private readonly logger: Logger,
  ) {}

  async getBusRoute(serviceKey: string) {
    // 공공데이터 포털에서 제공하는 버스노선 ID 데이터에서 추출한 ID값들.
    const routeData = JSON.parse(fs.readFileSync('src/routeData.json', 'utf8'));

    // 서울시 버스 노선중 3개 무작위 선택.
    const routePick = _.sampleSize(routeData, 3);

    // 무작위 추출한 3개의 노선으로 실시간 도착정보를 호출하기 위한 URI Encode
    const urlList = routePick.map((el) => {
      return encodeURI(serviceKey, el.ROUTE_ID);
    });

    // 공공데이터 API 호출
    const busRouteData = await busAPI(urlList, this.httpSvc);

    const busStop = [];
    // API 호출을 통해 전달 받은 정보중 정류장에 도착정보를 한 배열에 저장.
    busRouteData.map((el) => {
      if (el.msgHeader.headerCd === '0') {
        busStop.push(...el.msgBody.itemList);
      } else {
        this.logger.error(
          `서울시 버스 정보 API 비정상 작동. errorCode : ${el.msgHeader.headerCd}`,
        );
      }
    });

    // 도착버스를 최대 2개까지 확인 가능 하기 때문에 5분 이내 도착 버스가 2대인 정류장만 추출.
    // 지수평활 도착예정시간과 대조하면서 계산해 봤지만 arrmsg1(도착예정시간 메세지)와 정확히 일치하는 값은 traTime뿐이여서 해당 값으로 진행
    const busStopFillter = [];
    for (let i = 0; i < busStop.length; i++) {
      if (busStopFillter.length >= 3) {
        this.logger.log('추출 개수 충족(5분이내 2대)');
        break;
      }
      if (
        Number(busStop[i].traTime1) > 0 &&
        Number(busStop[i].traTime1) <= 300 &&
        busStop[i].arrmsg1 !== '출발대기' &&
        Number(busStop[i].traTime2) > 0 &&
        Number(busStop[i].traTime2) <= 300 &&
        busStop[i].arrmsg2 !== '출발대기'
      ) {
        busStopFillter.push(busStop[i]);
      }
    }

    // 2대 이상 정류장 추출 개수가 3개 미만이면 5분 이내 도착 버스가 1대인 정류장도 3개가 되기전 까지 추출
    if (busStopFillter.length < 3) {
      this.logger.log('추출 개수 부족');

      for (let i = 0; i < busStop.length; i++) {
        if (busStopFillter.length >= 3) {
          this.logger.log('추출 개수 충족');
          break;
        }
        if (
          (Number(busStop[i].traTime1) > 0 &&
            Number(busStop[i].traTime1) <= 300 &&
            busStop[i].arrmsg1 !== '출발대기') ||
          (Number(busStop[i].traTime2) > 0 &&
            Number(busStop[i].traTime2) <= 300 &&
            busStop[i].arrmsg2 !== '출발대기')
        ) {
          if (busStopFillter.includes(busStop[i]) === false) {
            console.log('추출 개수 추가 했음');

            busStopFillter.push(busStop[i]);
          }
        }
      }
    }

    const busPickData = busDataPicker(busStopFillter);

    return busPickData;
  }
}

async function busAPI(urlList: string[], httpSvc: HttpService) {
  const busRouteData = [];

  for (let i = 0; i < urlList.length; i++) {
    busRouteData.push((await httpSvc.get(urlList[i]).toPromise()).data);
  }
  return busRouteData;
}

// URI 인코딩
function encodeURI(serviceKey: string, busRouteId: number) {
  let url = 'http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll';
  let queryParams =
    '?' + encodeURIComponent('serviceKey') + `=${serviceKey}`; /* Service Key*/
  queryParams +=
    '&' +
    encodeURIComponent('busRouteId') +
    '=' +
    encodeURIComponent(`${busRouteId}`) +
    '&' +
    encodeURIComponent('resultType') +
    '=' +
    encodeURIComponent(`json`); /* */

  return url + queryParams;
}

// 최종 출려을 위한 필요 데이터만 추출 및 정렬.
function busDataPicker(busStopFillter: any[]) {
  const busPickData = [];

  busStopFillter.map((el) => {
    if (el.traTime1 <= 300 && 0 < el.traTime1) {
      busPickData.push({
        노선명: el.rtNm,
        버스번호: el.vehId1,
        번호판: el.plainNo1,
        도착예정시간: el.arrmsg1,
        '도착예정시간(초)': el.traTime1,
      });
    }

    if (el.traTime2 <= 300 && 0 < el.traTime2) {
      busPickData.push({
        노선명: el.rtNm,
        버스번호: el.vehId2,
        번호판: el.plainNo2,
        도착예정시간: el.arrmsg2,
        '도착예정시간(초)': el.traTime2,
      });
    }
  });

  busPickData.sort((a, b) => {
    return a['도착예정시간(초)'] - b['도착예정시간(초)'];
  });
  return busPickData;
}
