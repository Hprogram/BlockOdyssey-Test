import { Controller, Get } from '@nestjs/common';
import { BusService } from './bus.service';

@Controller('bus')
export class BusController {
  constructor(private readonly busSvc: BusService) {}

  @Get()
  async getBus() {
    // 키는 ENV 파일을 이용하는 등 관리해야하지만 해당 부분 코드가 없으면 API 호출이 이루어지지 않기 때문에 삽입하였습니다.
    return await this.busSvc.getBusRoute(
      '971VYkgb1zWwrmdJ2zXPqRAvvUUwikfoDXBNMOnpzOmxVevF3zEiLy%2B0TGzAl%2BO8O0BSxSKYFojzGwHCq%2BpjWw%3D%3D',
    );
  }
}
