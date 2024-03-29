import { publicAxios } from "@/config/configAxios";
import { GroupProductHeaderModel } from "@/models";
import { GroupProductHeaderJson } from "@/types/json";
import { MSG_SUCCESS } from "@/utils/constants";

class GroupProductHeaderApi {
  getListFromJson(json: any): GroupProductHeaderModel[] {
    return json.map((item: any) => new GroupProductHeaderModel(item));
  }

  getAllJson(): Promise<GroupProductHeaderJson[]> {
    return new Promise(async (resolve, _) => {
      try {
        const { data, message } = await (publicAxios().get("group-product", {
          params: { forHeader: true },
        }) as Promise<{
          data: GroupProductHeaderJson[];
          message: string;
        }>);

        if (message === MSG_SUCCESS) {
          resolve(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        resolve([]);
      }
    });
  }

  getAll(): Promise<GroupProductHeaderModel[]> {
    return new Promise(async (resolve, _) => {
      try {
        const { data, message } = await (publicAxios().get("group-product", {
          params: { forHeader: true },
        }) as Promise<{
          data: any;
          message: string;
        }>);

        if (message === MSG_SUCCESS) {
          resolve(this.getListFromJson(data));
        }
      } catch (error) {
        console.log(error);
      } finally {
        resolve([]);
      }
    });
  }
}

export default GroupProductHeaderApi;
