export interface ISerialPort {
  path: string;
  manufacturer: string;
  serialNumber: string;
  pnpId: string;
  locationId: string;
  friendlyName: string;
  vendorId: string;
  productId: string;
}

export type TSerialPortsResponse = ISerialPort[];
