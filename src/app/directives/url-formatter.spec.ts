import { UrlFormatter } from "../services/url-formatter";

describe('UrlFormatter', () => {
  it('should create an instance', () => {
    const directive = new UrlFormatter();
    expect(directive).toBeTruthy();
  });
});
