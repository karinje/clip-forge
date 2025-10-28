export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

