import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slice/authSlice";
import { publicRoutes } from "../../utils/routes";
import Header from "./Header";
import Sidebar from "./Sidebar";

type Props = Partial<{
  children: ReactNode;
  pageTitle: string;
}>;

const AdminLayout = ({ children, pageTitle }: Props) => {
  const router = useRouter();
  const { profile, isSuccess } = useSelector(authSelector);
  const theme = useTheme();
  const macthXL = useMediaQuery(theme.breakpoints.up("xl"));
  const [openSidebar, setOpenSidebar] = useState<boolean>(macthXL);

  const handleToggle = () => {
    setOpenSidebar((o) => !o);
  };

  console.log(macthXL, openSidebar);

  useEffect(() => {
    if (router.pathname.includes("/admin") && isSuccess && !profile)
      router.push(publicRoutes.adminSignin);
  }, [isSuccess, profile]);

  useEffect(() => {
    setOpenSidebar(macthXL);
  }, [macthXL]);

  return profile ? (
    <Box display="flex">
      <Sidebar open={openSidebar} />
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          width: {
            xs: "calc(100vw - 60px)",
            xl: "calc(100vw - 320px)",
          },
        }}
      >
        <Header pageTitle={pageTitle} onToggle={handleToggle} />
        <Box flex={1} padding="16px">
          {children}
        </Box>
      </Box>
    </Box>
  ) : null;
};

export default AdminLayout;
