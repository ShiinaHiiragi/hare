import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import katex from "katex";
import "katex/dist/katex.min.css";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  noneSelect: {
    userSelect: "none"
  },
  preview: {
    minHeight: "4rem",
    padding: theme.spacing(1, 0)
  }
}));

// WARNING: this is an uncontrollable component
export default function KaTeX(props) {
  const classes = useStyles();
  const { lang, open, quill, handleClose } = props;
  const ref = React.useRef();
  const updateInput = (event) => {
    katex.render(event.target.value, document.getElementById("preview"), {
      displayMode: true,
      throwOnError: false,
      strict: false
    });
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      className={classes.noneSelect}
    >
      <DialogTitle>{lang.popup.katex.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {lang.popup.katex.text}
        </DialogContentText>
        <TextField
          fullWidth
          multiline
          rows={4}
          required
          label={lang.popup.katex.label}
          inputRef={ref}
          onChange={updateInput}
        />
        <div className={classes.preview} id="preview"></div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          {lang.common.apply}
        </Button>
        <Button onClick={handleClose} color="primary">
          {lang.common.back}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
