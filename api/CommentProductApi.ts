import { privateAxios, publicAxios } from "@/config/configAxios";
import { CommentProductModel, ResponseGetAllModel } from "@/models";
import { CreateCommentProductDTO } from "@/types/dtos";
import { CommentProductParams } from "@/types/params";
import { MSG_SUCCESS } from "@/utils/constants";

class CommentProductApi {
  nameApi: string;
  constructor() {
    this.nameApi = "comment-product";
  }
  getListFromJson(json: any): CommentProductModel[] {
    return json.map((item: any) => new CommentProductModel(item));
  }

  getAll(params?: CommentProductParams): Promise<{
    commentProductData: ResponseGetAllModel<CommentProductModel>;
    userCommentProduct: CommentProductModel;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (publicAxios().get(this.nameApi, {
          params,
        }) as Promise<{
          data: { items: any; count: number; userCommentProduct: any };
          message: string;
        }>);
        const { items, count, userCommentProduct } = data;
        resolve({
          commentProductData:
            message === MSG_SUCCESS
              ? new ResponseGetAllModel<CommentProductModel>(
                  this.getListFromJson(items),
                  count
                )
              : new ResponseGetAllModel<CommentProductModel>(),
          userCommentProduct:
            message === MSG_SUCCESS && userCommentProduct
              ? new CommentProductModel(userCommentProduct)
              : new CommentProductModel(),
        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  create(dto: CreateCommentProductDTO): Promise<CommentProductModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (privateAxios().post(
          this.nameApi,
          dto
        ) as Promise<{
          data: any;
          message: string;
        }>);
        resolve(
          message === MSG_SUCCESS
            ? new CommentProductModel(data)
            : new CommentProductModel()
        );
      } catch (error) {
        console.log(error);
      }
    });
  }

  update({
    id,
    dto,
  }: {
    id: number;
    dto: Partial<CreateCommentProductDTO>;
  }): Promise<CommentProductModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (privateAxios().patch(
          `${this.nameApi}/${id}`,
          dto
        ) as Promise<{
          data: any;
          message: string;
        }>);
        resolve(
          message === MSG_SUCCESS
            ? new CommentProductModel(data)
            : new CommentProductModel()
        );
      } catch (error) {
        console.log(error);
      }
    });
  }

  getById(id: number): Promise<CommentProductModel> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, message } = await (publicAxios().get(
          `${this.nameApi}/${id}`
        ) as Promise<{
          data: any;
          message: string;
        }>);

        resolve(
          message === MSG_SUCCESS
            ? new CommentProductModel(data)
            : new CommentProductModel()
        );
      } catch (error) {
        console.log(error);
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
      }
    });
  }
}

export default CommentProductApi;
