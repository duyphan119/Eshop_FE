import { privateAxios, publicAxios } from "../config/configAxios";
import { ProductModel } from "../models";
import ResponseGetAllModel from "../models/ResponseGetAllModel";
import UploadRepository from "../repositories/UploadRepository";
import { PaginationParams, ProductParams, SortParams } from "../types/params";
import { CreateProductDTO, UpdateProductDTO } from "../types/dtos";
import { MSG_SUCCESS } from "../utils/constants";

class ProductApi {
  nameApi: string;
  constructor() {
    this.nameApi = "product";
  }

  getListFromJson(json: any): ProductModel[] {
    return json.map((item: any) => new ProductModel(item));
  }

  search(
    params?: PaginationParams & SortParams & { q: string }
  ): Promise<ResponseGetAllModel<ProductModel>> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (publicAxios().get(
          `${this.nameApi}/search`,
          {
            params: { ...params, product_variants: true },
          }
        ) as Promise<{
          data: { items: any; count: number };
          message: string;
        }>);
        const { items, count } = data;
        const response =
          message === MSG_SUCCESS
            ? new ResponseGetAllModel<ProductModel>(
                this.getListFromJson(items),
                count
              )
            : new ResponseGetAllModel<ProductModel>();
        resolve(response);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  getAll(params?: ProductParams): Promise<ResponseGetAllModel<ProductModel>> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (publicAxios().get(this.nameApi, {
          params,
        }) as Promise<{
          data: { items: any; count: number };
          message: string;
        }>);
        const { items, count } = data;
        const response =
          message === MSG_SUCCESS
            ? new ResponseGetAllModel<ProductModel>(
                this.getListFromJson(items),
                count
              )
            : new ResponseGetAllModel<ProductModel>();
        resolve(response);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  create(dto: CreateProductDTO): Promise<ProductModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (privateAxios().post(
          this.nameApi,
          dto
        ) as Promise<{
          data: any;
          message: string;
        }>);
        const Product = this.getListFromJson([data])[0];
        resolve(message === MSG_SUCCESS ? Product : new ProductModel());
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  update({
    id,
    dto,
  }: {
    id: number;
    dto: Partial<UpdateProductDTO>;
  }): Promise<ProductModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (privateAxios().patch(
          `${this.nameApi}/${id}`,
          dto
        ) as Promise<{
          data: any;
          message: string;
        }>);
        const Product = this.getListFromJson([data])[0];
        resolve(message === MSG_SUCCESS ? Product : new ProductModel());
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  getById(id: number): Promise<ProductModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (publicAxios().get(
          `${this.nameApi}/${id}`
        ) as Promise<{
          data: any;
          message: string;
        }>);

        resolve(
          message === MSG_SUCCESS ? new ProductModel(data) : new ProductModel()
        );
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  softDeleteSingle(id: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const { message } = await (privateAxios().delete(
          `${this.nameApi}/${id}`
        ) as Promise<{ message: string }>);

        resolve(message === MSG_SUCCESS);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  softDeleteMultiple(ids: number[]): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const { message } = await (privateAxios().put(
          `${this.nameApi}/delete-multiple`,
          { ids }
        ) as Promise<{ message: string }>);

        resolve(message === MSG_SUCCESS);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
}

export default ProductApi;
