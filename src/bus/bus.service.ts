import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as _ from 'lodash';

@Injectable()
export class BusService {
  async getBusRoute(serviceKey: string, busRouteId: number) {
    const routeData = JSON.parse(fs.readFileSync('src/routeData.json', 'utf8'));

    const routePick = _.sampleSize(routeData, 3);

    console.log(routePick);

    let url = 'http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll';
    let queryParams =
      '?' +
      encodeURIComponent('serviceKey') +
      `=${serviceKey}`; /* Service Key*/
    queryParams +=
      '&' +
      encodeURIComponent('busRouteId') +
      '=' +
      encodeURIComponent(`${busRouteId}`) +
      '&' +
      encodeURIComponent('resultType') +
      '=' +
      encodeURIComponent(`json`); /* */

    // const a = await axios.get(url + queryParams);
    // console.log(a.data);

    // console.log(a.data.msgBody.itemList.length);

    // return a.data;
    return '테스트중';
  }

  async encodeURI(serviceKey: string, busRouteId: number) {
    let url = 'http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll';
    let queryParams =
      '?' +
      encodeURIComponent('serviceKey') +
      `=${serviceKey}`; /* Service Key*/
    queryParams +=
      '&' +
      encodeURIComponent('busRouteId') +
      '=' +
      encodeURIComponent(`${busRouteId}`) +
      '&' +
      encodeURIComponent('resultType') +
      '=' +
      encodeURIComponent(`json`); /* */

    // const a = await axios.get(url + queryParams);
    // console.log(a.data);

    // console.log(a.data.msgBody.itemList.length);

    // return a.data;
    return url + queryParams;
  }
}
