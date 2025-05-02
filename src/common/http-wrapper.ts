import * as path from "path";
import axios, { AxiosRequestConfig } from "axios";
import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Readable } from "stream";

@Injectable()
export class HttpServiceWrapper {
  protected readonly logger = new Logger(HttpServiceWrapper.name);
  constructor(protected readonly configService: ConfigService) {}

  /**
   * Makes an HTTP request to an external API endpoint.
   * @param endpoint - The API endpoint to call.
   * @param method - The HTTP method (e.g., GET, POST, PUT, DELETE).
   * @param data - The request payload (optional).
   * @param stream - Whether the response should be streamed (optional).
   * @returns The response data as a generic type `T`.
   */
  async callApi<T = any>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: any,
    returnStream = false
  ): Promise<T | Readable> {
    this.logger.debug(
      `API request: ${JSON.stringify({ url, method, data })}`
    );

    try {
      const config: AxiosRequestConfig = {
        url,
        method: method as any,
        headers: {
          "Content-Type": "application/json",
        },
        responseType: returnStream ? "stream" : "json",
        data: data ? JSON.stringify(data) : undefined,
      };

      const response = await axios(config);
      return response.data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Axios Error: ${error.response?.status} - ${
            error.response?.statusText
          }\n${JSON.stringify(error.response?.data)}`
        );
        if (error.response?.data) {
          throw new BadRequestException(error.response.data);
        }
      }
      throw error;
    }
  }
}


