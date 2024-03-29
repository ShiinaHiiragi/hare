import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import cookie from "react-cookies";
import SignTitle from "../Component/SignTitle";
import SignInForm from "../Component/Form";
import Copyright from "../Component/Copyright";
import MessageBox from "../Dialogue/MessageBox";
import Load from "../Dialogue/Load";
import requestURL from "../Interface/Constant";
import { languagePicker, nameMap } from "../Language/Lang";
import { ThemeProvider } from "@material-ui/core/styles";
import {
  palette,
  cookieTime,
  cookieString,
  defaultPrimaryColor,
  defaultSecondaryColor,
  setStateDelay,
  getColorTheme
} from "../Interface/Constant";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    userSelect: "none"
  },
  image: {
    backgroundImage: `url(${requestURL}/src/cover)`,
    backgroundRepeat: "no-repeat",
    backgroundColor: 
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  overlay: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(33, 37, 41, 0.5)"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

export default function SignIn() {
  const classes = useStyles();

  // the state of language
  const [globalLang, setGlobalLang] = React.useState(languagePicker(nameMap.English));
  const [primaryColor, setPrimaryColor] = React.useState(defaultPrimaryColor);
  const [secondaryColor, setSecondaryColor] = React.useState(defaultSecondaryColor);
  React.useEffect(() => {
    let storageLang = cookie.load("lang");
    changeGlobalLang(storageLang || nameMap.English);
    cookieString(
      "primary",
      setPrimaryColor,
      defaultPrimaryColor,
      (cookie) => Object.keys(palette).includes(cookie)
    );
    cookieString(
      "secondary",
      setSecondaryColor,
      defaultSecondaryColor,
      (cookie) => Object.keys(palette).includes(cookie)
    );
  }, []);
  const changeGlobalLang = (targetValue) => {
    if (targetValue)
      setTimeout(() => setGlobalLang(languagePicker(targetValue)), setStateDelay * 0.5);
    cookie.save("lang", targetValue, { expires: cookieTime(3650) });
  };

  const colorTheme = React.useMemo(
    () => getColorTheme(primaryColor, secondaryColor),
    [primaryColor, secondaryColor]
  );

  // the setting of snackbar
  const [messageBoxInfo, setMessageBoxInfo] = React.useState({
    open: false,
    type: "success",
    message: ""
  });
  const toggleMessageBox = (message, type) => {
    setMessageBoxInfo({
      open: true,
      type: type,
      message: message
    });
  };
  const closeMessageBox = () => {
    setMessageBoxInfo((snackbarInfo) => ({
      ...snackbarInfo,
      open: false
    }));
  };

  // the state of loading scene
  let clockLoading = null;
  const [loading, setLoading] = React.useState(false);
  const toggleLoading = () =>
    (clockLoading = setTimeout(() => {
      clockLoading = null;
      setLoading(true);
    }, 1000));
  const closeLoading = () => {
    if (clockLoading) clearTimeout(clockLoading);
    setLoading(false);
  };

  return (
    <ThemeProvider theme={colorTheme}>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <SignTitle lang={globalLang} />
            <SignInForm
              lang={globalLang}
              handle={{
                toggleMessageBox: toggleMessageBox,
                changeLang: changeGlobalLang,
                toggleLoading: toggleLoading,
                closeLoading: closeLoading
              }}
              URL={requestURL}
            />
            <Copyright
              lang={globalLang}
              handleToggleMessageBox={toggleMessageBox}
            />
          </div>
        </Grid>
        <Grid item xs={false} sm={4} md={7} className={classes.image}>
          <div className={classes.overlay} />
        </Grid>
        <MessageBox
          open={messageBoxInfo.open}
          handleClose={closeMessageBox}
          messageBoxType={messageBoxInfo.type}
          messageBoxMessage={messageBoxInfo.message}
        />
        <Load open={loading} />
      </Grid>
    </ThemeProvider>
  );
}
