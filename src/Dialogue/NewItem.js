import React from "react";
import clsx from "clsx";
import MonacoEditor from "react-monaco-editor";
import { Selection } from "monaco-editor";
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
import DoneIcon from "@material-ui/icons/Done";
import CloseIcon from "@material-ui/icons/Close";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import PackedMarkdown from "../Component/Markdown";
import cookie from "react-cookies";
import ExitConfirm from "./ExitConfirm";
import SubmitConfirm from "./SubmitConfirm";
import { HotKeys } from "react-hotkeys";
import { PanelContext } from "../Page/Panel";
import {
  stringFormat,
  cookieTime,
  emSpace,
  autoKey,
  byteSize,
  maxItemByte,
  autoQuery,
  autoKeys,
  inlineCode
} from "../Interface/Constant";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  noneSelect: {
    userSelect: "none"
  },
  container: {
    overflowY: "hidden"
  },
  hotkey: {
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%"
  },
  bar: {
    position: "relative"
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
    flex: 1
  },
  itemField: {
    margin: theme.spacing(1, 0)
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
      flexDirection: "column"
    },
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
      height: 0
    }
  },
  editorContainer: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      height: "49%"
    },
    [theme.breakpoints.up("md")]: {
      width: "49%",
      height: "100%"
    },
    "& .mtki": {
      fontStyle: "normal !important"
    },
    "& .mtkb": {
      fontWeight: "normal !important"
    }
  },
  editorPreview: {
    [theme.breakpoints.down("sm")]: {
      height: "49%",
      padding: theme.spacing(1, 4)
    },
    [theme.breakpoints.up("md")]: {
      height: "100%",
      padding: theme.spacing(1, 2)
    },
    overflowY: "auto"
  }
}));

const keyMap = {
  save: "ctrl+s",
  submit: "ctrl+enter",
  query: "ctrl+left",
  key: "ctrl+right"
};

export default function NewItem(props) {
  const classes = useStyles();
  const { open, state, handle } = props;
  const context = React.useContext(PanelContext);

  // the state of ID and tab
  const [itemID, setItemID] = React.useState(0);
  const [itemIDCheck, setItemIDCheck] = React.useState(false);
  const [tab, setTab] = React.useState(0);

  // the state of text input
  const [query, setQuery] = React.useState("");
  const [key, setKey] = React.useState("");
  const [markQuery, setMarkQuery] = React.useState("");
  const [markKey, setMarkKey] = React.useState("");
  const [wordWrap, setWordWrap] = React.useState("on");

  // the state and dialogue
  const [exit, setExit] = React.useState(false);
  const [apply, setApply] = React.useState(false);
  const [editKey, setEditKey] = React.useState(false);
  const [noSave, setNoSave] = React.useState(false);

  const monacoChange = (value) => {
    setNoSave(true);
    tab ? setKey(value) : setQuery(value);
  }

  // whata to do when opening dislogue
  React.useEffect(() => {
    if (open) {
      // load wordwrap from cookie
      const savedWrap = cookie.load("__wordWrap");
      if (savedWrap !== "off") {
        cookie.save("__wordWrap", "on", { expires: cookieTime(3650) })
      } else setWordWrap(savedWrap);

      // set query and key in edit mode
      setItemID(state.listLength + 1);
      if (state.editItem) {
        if (state.editItem === "key") setTab(1);
        setQuery(state.apiValue.query);
        setKey(state.apiValue.key);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onEditorReady = (editor, monaco) => {
    // the editor may be wraped by closure so every time
    // the editor is loaded the closure should be updated
    let closureWordWrap = wordWrap;
    editor.addAction({
      id: "word-wrap",
      label: "Word Wrap",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KEY_Z],
      contextMenuGroupId: "2_outershortcut",
      run: () => {
        if (closureWordWrap === "on") {
          setWordWrap("off");
          closureWordWrap = "off";
          cookie.save("__wordWrap", "off", { expires: cookieTime(3650) });
        } else {
          setWordWrap("on");
          closureWordWrap = "on";
          cookie.save("__wordWrap", "on", { expires: cookieTime(3650) });
        }
      }
    });
    editor.addAction({
      id: "line-tag",
      label: "Insert Line Tag",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Q],
      contextMenuGroupId: "1_modification",
      run: (editor) => {
        const operation = {
          range: editor.getSelection(),
          text: state.lineTag,
          forceMoveMarkers: true
        };
        editor.executeEdits("line-tag", [operation]);
      }
    });
    editor.addAction({
      id: "space",
      label: "Insert EM Space",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D],
      contextMenuGroupId: "1_modification",
      run: (editor) => {
        const operation = {
          range: editor.getSelection(),
          text: emSpace,
          forceMoveMarkers: true
        };
        editor.executeEdits("space", [operation]);
      }
    });
    editor.addAction({
      id: "answer",
      label: "Insert Answer Tag",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K],
      contextMenuGroupId: "1_modification",
      run: (editor) => {
        const { startLineNumber, startColumn } = editor.getSelection();
        const operation = {
          range: editor.getSelection(),
          text: autoKey,
          forceMoveMarkers: true
        };
        editor.executeEdits(
          "key-tag",
          [operation],
          [new Selection(
            startLineNumber,
            startColumn + 2,
            startLineNumber,
            startColumn + 2
          )]
        );
      }
    });
    editor.addAction({
      id: "code",
      label: "Insert Inline Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.US_BACKTICK],
      contextMenuGroupId: "1_modification",
      run: (editor) => {
        const { startLineNumber, startColumn } = editor.getSelection();
        const operation = {
          range: editor.getSelection(),
          text: inlineCode,
          forceMoveMarkers: true
        };
        editor.executeEdits(
          "key-tag",
          [operation],
          [new Selection(
            startLineNumber,
            startColumn + 1,
            startLineNumber,
            startColumn + 1
          )]
        );
      }
    });
    editor.addAction({
      id: "save-in-editor",
      label: "Save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
      contextMenuGroupId: "2_outershortcut",
      run: () => document.getElementById("save-button").click()
    });
    editor.addAction({
      id: "submit-in-editor",
      label: "Submit and Quit",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      contextMenuGroupId: "2_outershortcut",
      run: () => document.getElementById("submit-button").click()
    });
    editor.addAction({
      id: "query-tab",
      label: "Switch to Question",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.LeftArrow],
      contextMenuGroupId: "2_outershortcut",
      run: () => document.getElementById("query-tab").click()
    });
    editor.addAction({
      id: "key-tab",
      label: "Switch to Answer",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.RightArrow],
      contextMenuGroupId: "2_outershortcut",
      run: () => document.getElementById("key-tab").click()
    });
  };

  const tabChange = (_, index) => {
    if (index) setEditKey(true);
    setTab(index);
  };
  const idChange = (event) => {
    const valueJudge = event.target.value;
    setItemID((itemID) => {
      if (/^[0-9]*$/.test(valueJudge))
        return valueJudge;
      else return itemID;
    });
  };

  // the icon button of exit
  const toggleExit = () => {
    if (noSave) setExit(true);
    else clearClose(false);
  };
  const clearClose = (save) => {
    if (save) return;
    handle.close();
    setTab(0);
    setItemIDCheck(false);
    setQuery("");
    setKey("");
    setMarkQuery("");
    setMarkKey("");
    setEditKey(false);
    setNoSave(false);
  };

  const toggleSave = () => {
    toggleApply(true);
    setNoSave(false);
    handle.setEditItem((editItem) => {
      if (!editItem) handle.setApiItemID(Number(itemID) | 0);
      // both "query" and "key" is true when cast to boolean
      // and this value is just used to set tab route when comming
      // into edit item panel, so saving is no matter which to set
      return "query";
    });
  };

  const keyHandler = {
    save: (event) => {
      event.preventDefault();
      if (noSave) toggleSave();
    },
    submit: () => toggleApply(false),
    query: () => setTab(0),
    key: () => setTab(1)
  };

  // the text button of continue
  const toggleApply = (save) => {
    const targetNumber = Number(itemID) | 0;
    if (targetNumber <= 0 || targetNumber > state.listLength + 1) {
      setItemIDCheck(true);
      handle.toggleMessageBox(context.lang.message.invalidItemID, "warning");
      return;
    } else setItemIDCheck(false);
    if (byteSize(query) + byteSize(key) > maxItemByte) {
      handle.toggleMessageBox(context.lang.message.itemOverflow, "warning");
      return;
    }
    if (!state.editItem && !save && !editKey && !autoQuery(query).keys.length) {
      setApply(true);
    } else if (!state.editItem) submitNew(save);
    else submitEdit(save);
  };

  const submitNew = (save) => {
    const targetItemID = Number(itemID) | 0;
    context.request("POST/new/item", {
      unitID: state.unitID,
      pageID: state.pageID,
      itemID: [targetItemID],
      query: query,
      key: key
    }).then((createTime) => {
      handle.setItemList((itemList) => {
        let newItemList = itemList.map((item) =>
          item.id >= targetItemID ? { ...item, id: item.id + 1 } : item
        );
        newItemList.splice(targetItemID - 1, 0, {
          id: targetItemID,
          query: query,
          key: key,
          time: createTime
        });
        for (let index = 0; index < state.trackSize; index += 1)
          newItemList[targetItemID - 1][index + 1] = "L";
        return newItemList;
      });
      handle.setPageDetail((pageDetail) => ({
        ...pageDetail,
        itemSize: pageDetail.itemSize + 1
      }))
      clearClose(save);
    });
  };

  const submitEdit = (save) => {
    context.request("POST/set/item", {
      unitID: state.unitID,
      pageID: state.pageID,
      itemID: [state.apiItemID],
      query: query,
      key: key
    }).then(() => {
      handle.setItemList((itemList) => itemList.map((item) => (
        item.id === state.apiItemID
          ? { ...item, query: query, key: key }
          : item
      )));
      clearClose(save);
    })
  };

  React.useEffect(() => {
    const unloadListener = (event) => {
      event.preventDefault();
      if (noSave) {
        event.returnValue = context.lang.panel.recall.unload;
        return context.lang.panel.recall.unload;
      }
    };
    window.addEventListener("beforeunload", unloadListener);
    return () => window.removeEventListener("beforeunload", unloadListener);
  }, [noSave, context.lang.panel.recall.unload]);

  React.useEffect(() => {
    if (key.length) {
      setMarkQuery(query);
      setMarkKey(key);
    } else {
      const { query: processQuery, keys } = autoQuery(query);
      setMarkQuery(processQuery)
      setMarkKey(autoKeys(keys, context.lang));
    }
  }, [state.editItem, query, key, context.lang])

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={toggleExit}
      className={classes.noneSelect}
      classes={{ paper: classes.container }}
    >
      <HotKeys keyMap={keyMap} handlers={keyHandler} className={classes.hotkey}>
        <AppBar className={classes.bar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleExit}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {state.editItem
                ? context.lang.popup.newItem.editTitle
                : context.lang.popup.newItem.title}
              {noSave && context.lang.popup.newItem.noSave}
            </Typography>
            <IconButton
              id="save-button"
              color="inherit"
              onClick={toggleSave}
              disabled={!noSave && !!state.editItem}
            >
              <SaveOutlinedIcon />
            </IconButton>
            <IconButton
              id="submit-button"
              color="inherit"
              onClick={() => toggleApply(false)}
            >
              <DoneIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent className={classes.content}>
          {state.showCaption && <DialogContentText style={state.editItem ? {} : { margin: "0" }}>
            {state.editItem
              ? stringFormat(context.lang.popup.newItem.editText, [
                context.lang.popup.newItem.editTextZero[tab ? "key" : "query"],
                state.apiItemID
              ])
              : stringFormat(context.lang.popup.newItem.text, [
                state.listLength
                  ? stringFormat(context.lang.popup.newItem.aboveOne, [
                      state.listLength + 1
                    ])
                  : context.lang.popup.newItem.onlyOne,
                state.listLength ? context.lang.popup.newItem.supply : ""
              ])}
          </DialogContentText>}
          {!state.editItem && <div className={classes.itemField}>
            <TextField
              required
              type="number"
              disabled={!state.listLength}
              error={itemIDCheck}
              value={itemID}
              onChange={idChange}
              label={context.lang.popup.newItem.itemID}
              className={classes.itemInput}
            />
          </div>}
          <Paper className={classes.editorField} variant="outlined" square>
            <Tabs
              value={tab}
              onChange={tabChange}
              variant="fullWidth"
              indicatorColor="primary"
            >
              <Tab id="query-tab" label={context.lang.popup.newItem.query} />
              <Tab id="key-tab" label={context.lang.popup.newItem.key} />
            </Tabs>
            <div className={classes.editorInput}>
              <div className={classes.editorContainer}>
                <MonacoEditor
                  width="100%"
                  height="100%"
                  language="markdown"
                  value={tab ? key : query}
                  onChange={monacoChange}
                  editorDidMount={onEditorReady}
                  options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                    wordWrap: wordWrap
                  }}
                />
              </div>
              <div style={{ width: "2%", height: "2%" }}></div>
              <Typography
                className={clsx(
                  classes.editorContainer,
                  classes.editorPreview,
                  "markdown-body"
                )}
                component="div"
                variant="body2"
              >
                <PackedMarkdown children={tab ? markKey : markQuery} />
              </Typography>
            </div>
          </Paper>
        </DialogContent>
      </HotKeys>
      <ExitConfirm
        open={exit}
        handleClose={() => setExit(false)}
        handleClearClose={() => clearClose(false)}
      />
      <SubmitConfirm
        open={apply}
        handleClose={() => setApply(false)}
        handleSubmit={() => submitNew(false)}
      />
    </Dialog>
  );
}
