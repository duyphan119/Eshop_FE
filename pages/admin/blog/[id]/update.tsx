import { Button, Grid, Paper } from "@mui/material";
import dynamic from "next/dynamic";
import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { CreateBlogDTO, getBlogById, updateBlog } from "../../../../apis/blog";
import { AdminLayout } from "../../../../layouts";
import { MSG_SUCCESS } from "../../../../utils/constants";
import { Blog } from "../../../../utils/types";
import { useRouter } from "next/router";
import "react-quill/dist/quill.snow.css";
import { uploadSingle } from "../../../../apis/upload";
import { useSnackbarContext } from "../../../../context/SnackbarContext";
import { RenderContentProps } from "../create";
import {
  AdminFormPaper,
  FooterForm,
  InputControl,
} from "../../../../components";
const ReactQuill = dynamic(import("react-quill"), { ssr: false });

type Props = {
  blog: Blog;
};

const UpdateBlog = ({ blog }: Props) => {
  const router = useRouter();
  const { show } = useSnackbarContext();
  const [files, setFiles] = useState<FileList | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateBlogDTO>({
    defaultValues: {
      content: blog.content,
      title: blog.title,
    },
  });

  const onSubmit: SubmitHandler<CreateBlogDTO> = async (data) => {
    try {
      let thumbnail;
      if (files) {
        const formData = new FormData();
        formData.append("image", files[0]);
        const { message, data: dataImage } = await uploadSingle(formData);
        if (message === MSG_SUCCESS) {
          thumbnail = dataImage.secure_url;
        }
      }

      const { message } = await updateBlog(blog.id, {
        ...data,
        ...(thumbnail ? { thumbnail } : {}),
      });
      if (message === MSG_SUCCESS) {
        show("Chỉnh sửa bài viết thành công", "success");
      }
    } catch (error) {
      console.log("UPDATE BLOG ERROR::", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AdminLayout pageTitle="Chỉnh sửa bài viết">
      <>
        <Head>
          <title>Chỉnh sửa bài viết</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AdminFormPaper title="Thông tin bài viết">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container rowSpacing={3} columnSpacing={3}>
              <Grid item xs={12}>
                <InputControl
                  required={true}
                  error={errors.title}
                  register={register("title", {
                    required: {
                      value: true,
                      message: "Tiêu đề không được để trống",
                    },
                  })}
                  label="Tiêu đề"
                />
              </Grid>
              <Grid item xs={12}>
                <InputControl
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFiles(e.target.files)
                  }
                  type="file"
                  label="Ảnh đại diện"
                />
              </Grid>
              <Grid item xs={12}>
                <div className="form-group">
                  {errors.content && errors.content.type === "validate" && (
                    <div className="form-error">{errors.content.message}</div>
                  )}
                  <Controller
                    control={control}
                    name="content"
                    rules={{
                      validate: (value) => {
                        if (value === "<p><br></p>") {
                          return "Nội dung không được để trống";
                        }
                      },
                    }}
                    render={(data: RenderContentProps) => {
                      return (
                        <ReactQuill
                          theme="snow"
                          value={data.field.value}
                          onChange={data.field.onChange}
                          placeholder="Nội dung bài viết"
                        />
                      );
                    }}
                  />
                  <label htmlFor="slug" className="form-label"></label>
                </div>
              </Grid>
              <Grid item xs={12}>
                <FooterForm onBack={() => router.back()} />
              </Grid>
            </Grid>
          </form>
        </AdminFormPaper>
      </>
    </AdminLayout>
  );
};

export async function getServerSideProps(context: any) {
  try {
    const { id } = context.query;
    const { message, data } = await getBlogById(+id);
    if (message === MSG_SUCCESS) {
      return { props: { blog: data } };
    }
  } catch (error) {
    console.log("getServerSideProps - getBlogById - error", error);
  }
  return { notFound: true };
}
export default UpdateBlog;
