import { Controller } from '@nestjs/common';

export function ApiController(path: string, version = 1) {
  return Controller(`/api/v${version}/${path}`);
}