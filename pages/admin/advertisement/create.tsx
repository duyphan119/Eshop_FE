import { Button, Grid, Paper } from "@mui/material";
import Head from "next/head";
import { ChangeEvent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  createAdvertisement,
  CreateAdvertisementDTO,
} from "../../../apis/advertisement";
import { AdminLayout } from "../../../layouts";

import { useRouter } from "next/router";
import "react-quill/dist/quill.snow.css";
import { uploadSingle } from "../../../apis/upload";
import { useSnackbarContext } from "../../../context/SnackbarContext";
import { MSG_SUCCESS } from "../../../utils/constants";

type Props = {};

const CreateAdvertisement = (props: Props) => {
  const router = useRouter();
  const { show } = useSnackbarContext();
  const [files, setFiles] = useState<FileList | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdvertisementDTO>({
    defaultValues: {
      href: "/",
      title: "",
      page: "Trang chủ",
    },
  });

  const onSubmit: SubmitHandler<CreateAdvertisementDTO> = async (data) => {
    try {
      let path;
      if (files) {
        const formData = new FormData();
        formData.append("image", files[0]);
        const { message, data: dataImage } = await uploadSingle(formData);
        if (message === MSG_SUCCESS) {
          path = dataImage.secure_url;
        }
      }

      const { message } = await createAdvertisement({
        ...data,
        ...(path ? { path } : {}),
      });
      if (message === MSG_SUCCESS) {
        show("Tạo quảng cáo thành công", "success");
      }
    } catch (error) {
      console.log("CREATE ADVERTISEMENT ERROR::", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AdminLayout pageTitle="Thêm mới quảng cáo">
      <>
        <Head>
          <title>Thêm mới quảng cáo</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Paper sx={{ padding: "16px" }}>
          <div
            style={{ fontSize: "2rem", fontWeight: "600", marginBottom: 16 }}
          >
            Thông tin thêm mới quảng cáo
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container rowSpacing={3} columnSpacing={3}>
              <Grid item xs={12}>
                <div className="form-group">
                  {errors.title && errors.title.type === "required" && (
                    <div className="form-error">
                      Tiêu đề không được để trống
                    </div>
                  )}
                  <input
                    type="text"
                    id="title"
                    className="form-control"
                    autoComplete="off"
                    {...register("title", { required: true })}
                  />
                  <label htmlFor="title" className="form-label required">
                    Tiêu đề
                  </label>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="form-group">
                  <input
                    type="text"
                    id="page"
                    className="form-control"
                    autoComplete="off"
                    {...register("page")}
                  />
                  <label htmlFor="page" className="form-label">
                    Trang
                  </label>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="form-group">
                  <input
                    type="text"
                    id="href"
                    className="form-control"
                    autoComplete="off"
                    {...register("href")}
                  />
                  <label htmlFor="href" className="form-label">
                    Liên kết
                  </label>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="form-group">
                  <input
                    type="file"
                    id="path"
                    className="form-control"
                    autoComplete="off"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFiles(e.target.files)
                    }
                  />
                  <label htmlFor="path" className="form-label">
                    Hình ảnh
                  </label>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBack}
                >
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  style={{ marginLeft: 8 }}
                >
                  Lưu
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </>
    </AdminLayout>
  );
};

export default CreateAdvertisement;