import { createSlice } from "@reduxjs/toolkit";
import { CreateBlogDTO, BlogQueryParams } from "../../apis/blog";
import { EMPTY_ITEMS } from "../../utils/constants";
import { FetchState, Blog, ResponseItems } from "../../utils/types";
import { ActionPayload, RootState } from "../store";

const NAME_SLICE = "blog";

export type CreateBlogPayload = {
  dto: CreateBlogDTO;
} & Partial<{ files: FileList | null }>;
export type UpdateBlogPayload = {
  id: number;
} & Partial<CreateBlogPayload>;

type State = {
  blogData: ResponseItems<Blog>;
  openModalPVI: boolean;
  openModalPV: boolean;
  openModalPreview: boolean;
  current: Blog | null;
  openDialog: boolean;
  isBack: boolean;
  blogEditing: Blog | null;
  isDeleted: boolean;
};

const INITIAL_STATE: State = {
  blogData: EMPTY_ITEMS,
  openModalPVI: false,
  openModalPreview: false,
  openModalPV: false,
  openDialog: false,
  current: null,
  isBack: false,
  blogEditing: null,
  isDeleted: false,
};

export const blogSlice = createSlice({
  name: NAME_SLICE,
  initialState: INITIAL_STATE,
  reducers: {
    fetchBlogData: (state, action: ActionPayload<BlogQueryParams>) => {
      state.isBack = false;
    },
    setBlogData: (state, action: ActionPayload<ResponseItems<Blog>>) => {
      const blogData = action.payload;
      state.blogData = blogData;
    },
    showDialog: (state, action: ActionPayload<Blog>) => {
      state.current = action.payload;
      state.openDialog = true;
    },
    hideDialog: (state) => {
      state.current = null;
      state.openDialog = false;
    },
    fetchCreateBlog: (state, action: ActionPayload<CreateBlogPayload>) => {
      state.isBack = false;
    },
    setCurrent: (state, action: ActionPayload<Blog | null>) => {
      state.current = action.payload;
    },
    fetchHeaderData: (state) => {
      state.isBack = false;
    },
    back: (state) => {
      state.isBack = true;
    },
    fetchUpdateBlog: (state, action: ActionPayload<UpdateBlogPayload>) => {
      state.isBack = false;
    },
    setBlogEditing: (state, action: ActionPayload<Blog | null>) => {
      state.blogEditing = action.payload;
    },
    fetchGetBlogById: (state, action: ActionPayload<number>) => {
      state.isBack = false;
    },
    fetchDeleteBlog: (state, action: ActionPayload<number>) => {
      state.isBack = false;
      state.isDeleted = false;
    },
    fetchSoftDeleteBlog: (state, action: ActionPayload<number>) => {
      state.isBack = false;
    },
    fetchRestoreBlog: (state, action: ActionPayload<number>) => {
      state.isBack = false;
    },
    deleted: (state) => {
      state.isDeleted = true;
    },
    restore: (state, action: ActionPayload<number>) => {
      const index = state.blogData.items.findIndex(
        (item) => item.id === action.payload
      );

      if (index !== -1) {
        state.blogData.items[index].deletedAt = null;
      }
    },
    softDelete: (state, action: ActionPayload<number>) => {
      const index = state.blogData.items.findIndex(
        (item) => item.id === action.payload
      );

      if (index !== -1) {
        state.blogData.items[index].deletedAt = new Date().toISOString();
      }
    },
  },
});

export const blogReducers = {
  fetchBlogData: `${NAME_SLICE}/fetchBlogData`,
  fetchCreateBlog: `${NAME_SLICE}/fetchCreateBlog`,
  fetchHeaderData: `${NAME_SLICE}/fetchHeaderData`,
  fetchGetBlogById: `${NAME_SLICE}/fetchGetBlogById`,
  fetchUpdateBlog: `${NAME_SLICE}/fetchUpdateBlog`,
  fetchDeleteBlog: `${NAME_SLICE}/fetchDeleteBlog`,
  fetchSoftDeleteBlog: `${NAME_SLICE}/fetchSoftDeleteBlog`,
  fetchRestoreBlog: `${NAME_SLICE}/fetchRestoreBlog`,
};
export const blogSelector = (state: RootState): State => state.blog;
export const blogActions = blogSlice.actions;
export default blogSlice.reducer;
