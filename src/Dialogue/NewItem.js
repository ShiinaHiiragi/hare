import React from "react";
import clsx from "clsx"
import ReactMarkdown from "react-markdown"
import MonacoEditor from "react-monaco-editor";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Dialog from "@material-ui/core/Dialog";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "../Interface/Markdown.css";
import gfm from "remark-gfm";
import ExitConfirm from "./ExitConfirm";
import SubmitConfirm from "./SubmitConfirm";
import { stringFormat } from "../Interface/Constant";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  noneSelect: {
    userSelect: "none"
  },
  bar: {
    position: "relative",
  },
  content: {
    padding: theme.spacing(4, 6),
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      overflowY: "scroll"
    },
    [theme.breakpoints.up("md")]: {
      maxHeight: "100%"
    }
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  textField: {
    margin: theme.spacing(0)
  },
  itemField: {
    margin: theme.spacing(1, 0),
  },
  editorField: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      minHeight: "100vh",
      overflowY: "visible"
    },
    [theme.breakpoints.up("md")]: {
      flexGrow: 1,
      height: 0,
      overflowY: "visible"
    }
  },
  itemInput: {
    width: "20%",
    minWidth: 200
  },
  editorInput: {
    display: "flex",
    width: "100%",
    height: 0,
    flexGrow: 1,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
      height: 0,
    }
  },
  editorContainer: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: "49%",
    },
    [theme.breakpoints.up("md")]: {
      width: "49%",
      height: "100%"
    }
  },
  editorPreview: {
    [theme.breakpoints.down("sm")]: {
      height: "49%",
      padding: theme.spacing(1, 4),
    },
    [theme.breakpoints.up("md")]: {
      height: "100%",
      padding: theme.spacing(1, 2),
    },
    overflowY: "auto"
  }
}));

export default function NewItem(props) {
  const classes = useStyles();
  const { lang, data, state, handle } = props;

  // the state of text input
  const [itemID, setItemID] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [key, setKey] = React.useState("");
  const [itemIDCheck, setItemIDCheck] = React.useState(false);

  // the state of tab
  const [tab, setTab] = React.useState(0);
  const [editKey, setEditKey] = React.useState(true);

  // the state of dialogue
  const [exit, setExit] = React.useState(false);
  const [apply, setApply] = React.useState(false);

  React.useEffect(() => {
    if (state.open) {
      setItemID(state.listLength + 1);
    }
  }, [state.open]);

  const tabChange = (_, index) => {
    if (index) setEditKey(true);
    setTab(index);
  }
  const idChange = (event) => {
    const valueJudge = event.target.value;
    if (/^[0-9]*$/.test(valueJudge))
      setItemID(event.target.value);
  }

  // the icon button of exit
  const toggleExit = () => {
    if (query !== "" || key !== "")
      setExit(true);
    else clearClose();
  }
  const clearClose = (clear) => {
    if (clear) { setQuery(""); setKey(""); }
    handle.close();
    setTab(0);
    setEditKey(false);
    setItemIDCheck(false);
  }

  // the text button of continue
  const toggleApply = () => {
    const targetNumber = Number(itemID) | 0;
    if (targetNumber <= 0 || targetNumber > state.listLength + 1) {
      setItemIDCheck(true);
      handle.toggleMessageBox(lang.message.invalidItemID, "warning");
      return;
    } else setItemIDCheck(false);
    if (!editKey) setApply(true);
    else submit();
  }
  const submit = () => {
    console.log("SUBMIT");
  }

  return (
    <Dialog
      fullScreen
      open={state.open}
      onClose={toggleExit}
      className={classes.noneSelect}
    >
      <AppBar className={classes.bar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleExit}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {lang.popup.newItem.title}
          </Typography>
          <Button color="inherit" onClick={toggleApply}>
            {lang.common.apply}
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent className={classes.content}>
        <DialogContentText className={classes.textField}>
          {stringFormat(lang.popup.newItem.text, [
            state.listLength
              ? stringFormat(lang.popup.newItem.aboveOne, [state.listLength + 1])
              : lang.popup.newItem.onlyOne,
            state.listLength ? lang.popup.newItem.supply : "",
          ])}
        </DialogContentText>
        <div className={classes.itemField}>
          <TextField
            required
            type="number"
            disabled={!state.listLength}
            error={itemIDCheck}
            value={itemID}
            onChange={idChange}
            label={lang.popup.newItem.itemID}
            className={classes.itemInput}
          />
        </div>
        <Paper
          className={classes.editorField}
          variant="outlined"
          square
        >
          <Tabs
            value={tab}
            onChange={tabChange}
            variant="fullWidth"
            indicatorColor="primary"
          >
            <Tab label={lang.popup.newItem.query} />
            <Tab label={lang.popup.newItem.key} />
          </Tabs>
          <div className={classes.editorInput}>
            <div className={classes.editorContainer} >
              <MonacoEditor
                width="100%"
                height="100%"
                language="markdown"
                value={tab ? key : query}
                onChange={tab? setKey : setQuery}
                options={{
                  minimap: { enabled: false },
                  automaticLayout: true,
                  wordWrap: "on"
                }}
              />
            </div>
            <div style={{ width: "2%", height: "2%" }}></div>
            <Typography
              className={clsx(classes.editorContainer, classes.editorPreview, "markdown-body")}
              component="div"
              variant="body2"
            >
              <ReactMarkdown
                remarkPlugins={[gfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  img: ({node, ...props}) => <img style={{ maxWidth: "100%" }} {...props} />
                }}
                children={tab ? key : query}
              />
            </Typography>
          </div>
        </Paper>
      </DialogContent>
      <ExitConfirm
        lang={lang}
        open={exit}
        handleClose={() => setExit(false)}
        handleClearClose={() => clearClose(true)}
      />
      <SubmitConfirm
        lang={lang}
        open={apply}
        handleClose={() => setApply(false)}
        handleSubmit={submit}
      />
    </Dialog>
  );
}
