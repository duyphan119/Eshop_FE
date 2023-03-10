import { call, put, takeEvery } from "redux-saga/effects";
import { AdvertisementApi } from "../../api";
import { CreateAdvertisementDTO } from "../../apis/advertisement";
import { AdvertisementModel, ResponseGetAllModel } from "../../models";
import { AdvertisementParams } from "../../types/params";
import {
  advertisementActions,
  advertisementReducer,
} from "../slice/advertisementSlice";
import { fetchActions } from "../slice/fetchSlice";
import { ActionPayload } from "../store";

const advApi = new AdvertisementApi();

function* fetchGetAll({
  payload: params,
}: ActionPayload<AdvertisementParams>): any {
  let isError = true;
  try {
    yield put(fetchActions.start(advertisementReducer.fetchGetAll));
    const data: ResponseGetAllModel<AdvertisementModel> = yield call(() =>
      advApi.getAll(params)
    );
    isError = false;
    yield put(advertisementActions.setAdvertisementData(data));
    yield put(fetchActions.endAndSuccess());
  } catch (error) {
    console.log("advertisementActions.fetchGetAll", error);
  }
  if (isError) yield put(fetchActions.endAndError());
}

function* fetchCreate({
  payload,
}: ActionPayload<{ dto: CreateAdvertisementDTO; files: FileList | null }>) {
  let isError = true;
  try {
    yield put(fetchActions.start(advertisementReducer.fetchCreate));
    const { files, dto } = payload;
    const data: AdvertisementModel = yield call(() =>
      advApi.create({
        files,
        dto,
      })
    );
    if (data.id > 0) {
      isError = false;
      yield put(fetchActions.endAndSuccessAndBack());
    }
  } catch (error) {
    console.log("advertisementActions.fetchCreate", error);
  }
  if (isError) yield put(fetchActions.endAndError());
}

function* fetchUpdate({
  payload,
}: ActionPayload<{
  id: number;
  files: FileList | null;
  dto: Partial<CreateAdvertisementDTO>;
}>) {
  let isError = true;
  try {
    yield put(fetchActions.start(advertisementReducer.fetchUpdate));
    const { files, dto, id } = payload;
    const data: AdvertisementModel = yield call(() =>
      advApi.update({ id, dto, files })
    );
    if (data.id > 0) {
      isError = false;
      yield put(fetchActions.endAndSuccessAndBack());
    }
  } catch (error) {
    console.log("advertisementActions.fetchUpdate", error);
  }
  if (isError) yield put(fetchActions.endAndError());
}

function* fetchGetById({ payload }: ActionPayload<number>) {
  let isError = true;
  try {
    yield put(fetchActions.start(advertisementReducer.fetchGetById));
    const data: AdvertisementModel = yield call(() => advApi.getById(payload));
    if (data.id > 0) {
      isError = false;
      yield put(advertisementActions.setCurrent(data));
      yield put(fetchActions.endAndSuccess());
    }
  } catch (error) {
    console.log("advertisementActions.fetchGetById", error);
  }
  if (isError) yield put(fetchActions.endAndError());
}

function* fetchDeleteSingle({ payload: id }: ActionPayload<number>) {
  let isError = true;
  try {
    const result: boolean = yield call(() => advApi.deleteSingle(id));
    if (result) {
      isError = false;
      yield put(advertisementActions.deleted());
      yield put(fetchActions.endAndSuccess());
    }
  } catch (error) {
    console.log("advertisementActions.fetchDeleteSingle", error);
  }
  if (isError) yield put(fetchActions.endAndError());
}

export function* advertisementSaga() {
  yield takeEvery(advertisementReducer.fetchGetAll, fetchGetAll);
  yield takeEvery(advertisementReducer.fetchCreate, fetchCreate);
  yield takeEvery(advertisementReducer.fetchUpdate, fetchUpdate);
  yield takeEvery(advertisementReducer.fetchGetById, fetchGetById);
  yield takeEvery(advertisementReducer.fetchDeleteSingle, fetchDeleteSingle);
}
