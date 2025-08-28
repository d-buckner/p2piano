export default class ConfigProvider {
  private constructor() { }

  public static getServiceUrl(): string {
    return process.env.API_URL!;
  }
}
