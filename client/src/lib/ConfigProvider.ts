export default class ConfigProvider {
  private constructor() { }

  static getServiceUrl(): string {
    return process.env.API_URL!;
  }
}
