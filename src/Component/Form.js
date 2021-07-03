import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import SignUp from "../Dialogue/SignUp";
import LanguageSelector from "../Dialogue/LanguageSelector";

import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  form: {
    width: "100%",
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

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
  }

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
    email: "",
    password: ""
  });
  const [checker, setChecker] = React.useState({
    email: false,
    password: false
  });
  const setEmailInput = (event) => setValue(value => ({
    ...value,
    email: event.target.value
  }));
  const setPasswordInput = (event) => setValue(value => ({
    ...value,
    password: event.target.value
  }));
  
  const submitForm = () => {
    const emailNil = value.email === "",
      passwordNil = value.password === "";
    setChecker({ email: emailNil, password: passwordNil })
    if (emailNil || passwordNil) {
      props.handle.toggleMessageBox(props.lang.message.signInBlank, "warning");
    } else {
      // TODO: log in
    }
  };
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
