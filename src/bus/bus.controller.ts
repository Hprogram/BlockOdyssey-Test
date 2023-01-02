import { Controller, Get } from '@nestjs/common';
import { BusService } from './bus.service';

@Controller('bus')
export class BusController {
  constructor(private readonly busSvc: BusService) {}

  @Get()
  async getBus() {
    return await this.busSvc.getBusRoute(
      '971VYkgb1zWwrmdJ2zXPqRAvvUUwikfoDXBNMOnpzOmxVevF3zEiLy%2B0TGzAl%2BO8O0BSxSKYFojzGwHCq%2BpjWw%3D%3D',
      100100118,
    );
  }
}
