export interface IResponseBase {
  ok: boolean;
  results: object | string | Array<any>
  message: string;
}
