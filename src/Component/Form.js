import React from "react";
import ReactDOM from "react-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import axios from "axios";
import cookie from "react-cookies";
import SignUp from "../Dialogue/SignUp";
import LanguageSelector from "../Dialogue/LanguageSelector";
import Panel from "../Page/Panel";
import requestURL from "../Interface/Constant";
import { cookieTime, encryptPassword } from "../Interface/Constant";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  form: {
    width: "100%",
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

let emailCookie = cookie.load("email");
const setEmailCookie = (boxChecked, email) => {
  if (boxChecked) cookie.save("email", email, { expires: cookieTime(3650) });
  else cookie.remove("email");
};

function FormTip(props) {
  // the sign up information popup
  const [signUpDialogue, setSignUpDialogue] = React.useState(false);
  const toggleSignUpDialogue = () => setSignUpDialogue(true);
  const closeSignUpDialogue = () => setSignUpDialogue(false);

  // the language selector
  const [languageDialogue, setLanguageDialogue] = React.useState(false);
  const toggleLanguageSelector = () => setLanguageDialogue(true);
  const closeLanguageSelector = (targetValue) => {
    setLanguageDialogue(false);
    props.handleChangeLanguage(targetValue);
  };

  return (
    <Grid container>
      <Grid item xs>
        <Link href="#" variant="body2" onClick={toggleLanguageSelector}>
          {props.lang.signIn.language}
        </Link>
      </Grid>
      <Grid item>
        <Link href="#" variant="body2" onClick={toggleSignUpDialogue}>
          {props.lang.signIn.signUp}
        </Link>
      </Grid>
      <LanguageSelector
        lang={props.lang}
        open={languageDialogue}
        handleClose={closeLanguageSelector}
      />
      <SignUp
        lang={props.lang}
        open={signUpDialogue}
        handleClose={closeSignUpDialogue}
      />
    </Grid>
  );
}

export default function SignInForm(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState({
    email: emailCookie ? emailCookie : "",
    password: ""
  });
  const [checker, setChecker] = React.useState({
    email: false,
    password: false
  });
  const setEmailInput = (event) =>
    setValue((value) => ({
      ...value,
      email: event.target.value
    }));
  const setPasswordInput = (event) =>
    setValue((value) => ({
      ...value,
      password: event.target.value
    }));

  const submitForm = () => {
    const emailNil = value.email === "",
      passwordNil = value.password === "";
    setChecker({ email: emailNil, password: passwordNil });
    if (emailNil || passwordNil) {
      props.handle.toggleMessageBox(props.lang.message.signInBlank, "warning");
    } else {
      props.handle.toggleLoading();
      const encryptedPassword = encryptPassword(value.password, value.email);
      setEmailCookie(memory, value.email);

      // we don't use packedPOST for it didn't check token
      axios
        .post(`${requestURL}/data/sign`, {
          email: value.email,
          password: encryptedPassword
        })
        .then((res) => {
          props.handle.closeLoading();
          cookie.save("userID", res.data.uid, { expires: cookieTime(1) });
          cookie.save("token", res.data.token, { expires: cookieTime(1) });
          ReactDOM.render(
            <Panel userID={res.data.uid} token={res.data.token} session={res.data.session} />,
            document.getElementById("root")
          );
        })
        .catch((err) => {
          props.handle.closeLoading();
          props.handle.toggleMessageBox(
            `${props.lang.message.serverError}: ${
              err.response ? err.response.data : err
            }`,
            "error"
          );
        });
    }
  };

  const [memory, setMemory] = React.useState(emailCookie !== undefined);
  const changeMemory = (event) => setMemory(event.target.checked);

  return (
    <form className={classes.form} noValidate>
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        label={props.lang.signIn.email}
        autoComplete="email"
        error={checker.email}
        value={value.email}
        onChange={setEmailInput}
        autoFocus
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        label={props.lang.signIn.password}
        type="password"
        autoComplete="current-password"
        error={checker.password}
        value={value.password}
        onChange={setPasswordInput}
      />
      <FormControlLabel
        control={<Checkbox value="remember" color="primary" />}
        label={props.lang.signIn.memory}
        checked={memory}
        onChange={changeMemory}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        onClick={submitForm}
      >
        {props.lang.signIn.button}
      </Button>
      <FormTip
        lang={props.lang}
        handleChangeLanguage={props.handle.changeLang}
      />
    </form>
  );
}
