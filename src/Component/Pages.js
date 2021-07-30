import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ListIcon from "@material-ui/icons/List";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import UnitMenu from "../Dialogue/UnitMenu";
import PageMenu from "../Dialogue/PageMenu";
import NewUnitPage from "../Dialogue/NewUnitPage";
import EditUnit from "../Dialogue/EditUnit";
import DeleteConfirm from "../Dialogue/DeleteConfirm";
import { packedGET, packedPOST } from "../Interface/Request";
import { initMenu, pageIcon, routeIndex } from "../Interface/Constant";
import clsx from "clsx";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  list: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  nested: { paddingLeft: theme.spacing(4) },
  newPage: {
    flexGrow: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  center: { justifyContent: "center" }
}));

export default function Pages(props) {
  const classes = useStyles();
  const { lang, data, state, handle } = props;

  // fold and unfold the units
  const changeUnit = (targetID) => {
    state.listObject[state.currentSelect.unitID - 1].pages[state.currentSelect.pageID - 1]
      .route = state.currentSelect.route;
    handle.setListObject(
      state.listObject.map((item) =>
        item.unitID === targetID ? { ...item, open: !item.open } : item
      )
    );
  };

  // the states used for menus
  const [unitMenu, setUnitMenu] = React.useState(initMenu);
  const [pageMenu, setPageMenu] = React.useState(initMenu);
  const [currentUnitID, setCurrentUnitID] = React.useState(0);
  const [currentPageID, setCurrentPageID] = React.useState(0);
  const [currentName, setCurrentName] = React.useState("");
  const [currentFold, setCurrentFold] = React.useState(false);
  const [currentTop, setCurrentTop] = React.useState(false);
  const [currentButtom, setCurrentButtom] = React.useState(false);
  const toggleUnitMenu = (event, unitID) => {
    event.preventDefault();
    setCurrentUnitID(unitID);
    setCurrentPageID(-1);
    setCurrentFold(state.listObject[unitID - 1].open);
    setCurrentName(state.listObject[unitID - 1].unitName);
    setCurrentTop(unitID === 1);
    setCurrentButtom(unitID === state.listObject.length);
    setUnitMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
  };
  const togglePageMenu = (event, unitID, pageID) => {
    event.preventDefault();
    setCurrentUnitID(unitID);
    setCurrentPageID(pageID);
    setCurrentName(state.listObject[unitID - 1].pages[pageID - 1].pageName);
    setCurrentTop(pageID === 1);
    setCurrentButtom(pageID === state.listObject[unitID - 1].pages.length);
    setPageMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
  };

  const changeMove = (group, less) => {
    packedPOST({
      uri: "/set/swap-up",
      query: { userID: data.userID, group: group, less: less },
      msgbox: handle.toggleMessageBox,
      kick: handle.toggleKick,
      lang: lang
    }).then(() => {
      if (group) {
        handle.setListObject((listObject) => {
          listObject[less - 1] = listObject.splice(
            less,
            1,
            listObject[less - 1]
          )[0];
          return listObject.map((item) =>
            item.unitID === less
              ? { ...item, unitID: less + 1 }
              : item.unitID === less + 1
              ? { ...item, unitID: less }
              : item
          );
        });
      } else {
        handle.setListObject((listObject) => {
          let tempPageItem = listObject[less[0] - 1].pages;
          tempPageItem[less[1] - 1] = tempPageItem.splice(
            less[1],
            1,
            tempPageItem[less[1] - 1]
          )[0];
          tempPageItem[less[1] - 1].pageID = less[1];
          tempPageItem[less[1]].pageID = less[1] + 1;
          return listObject.map((item) =>
            item.unitID === less[0] ? { ...item, pages: tempPageItem } : item
          );
        });
      }
    });
  };

  // states used for inserting units or pages
  const [edit, setEdit] = React.useState(false);
  const [newUnitPage, setNewUnitPage] = React.useState(false);
  const [newUnitPageGroup, setNewUnitPageGroup] = React.useState(false);
  const [newUnitPageType, setNewUnitPageType] = React.useState(0);
  const [newUnitNameValue, setNewUnitNameValue] = React.useState("");
  const [newPageNameValue, setNewPageNameValue] = React.useState("");
  const [newPagePresentValue, setNewPagePresentValue] = React.useState("");
  const [newUnitNameCheck, setNewUnitNameCheck] = React.useState(false);
  const [newPageNameCheck, setNewPageNameCheck] = React.useState(false);
  const [newPagePresentCheck, setNewPagePresentCheck] = React.useState(false);
  const toggleNewUnitPage = (group, type, edit) => {
    setEdit(!!edit);
    setNewUnitNameValue("");
    setNewPageNameValue(
      edit ? state.listObject[type[0] - 1].pages[type[1] - 1].pageName : ""
    );
    setNewPagePresentValue(
      edit ? state.listObject[type[0] - 1].pages[type[1] - 1].pagePresent : ""
    );
    setNewUnitNameCheck(false);
    setNewPageNameCheck(false);
    setNewPagePresentCheck(false);
    setNewUnitPageGroup(group);
    setNewUnitPageType(type);
    setNewUnitPage(true);
  };

  // state used for editing unit name
  const [editUnit, setEditUnit] = React.useState(false);
  const [editUnitNameValue, setEditUnitNameValue] = React.useState("");
  const [editUnitNameCheck, setEditUnitNameCheck] = React.useState(false);
  const toggleEditUnit = () => {
    setEditUnitNameValue(currentName);
    setEditUnitNameCheck(false);
    setEditUnit(true);
  };

  // states used for deleting units and pages
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [deleteConfirmType, setDeleteConfirmType] = React.useState("");
  const toggleDeleteConfirm = (type) => {
    setDeleteConfirm(true);
    setDeleteConfirmType(type);
  };
  const deleteUnitPage = (userID, unitID, pageID) => {
    packedPOST({
      uri: "/set/delete-up",
      query: {
        userID: userID,
        unitID: unitID,
        pageID: pageID,
        group: pageID > 0 ? false : true
      },
      msgbox: handle.toggleMessageBox,
      kick: handle.toggleKick,
      lang: lang
    }).then((out) => {
      if (out === "unit") {
        handle.setListObject((listObject) => {
          listObject.splice(unitID - 1, 1);
          return listObject.map((item) =>
            item.unitID > unitID ? { ...item, unitID: item.unitID - 1 } : item
          );
        });
      } else {
        state.listObject[unitID - 1].pages.splice(pageID - 1, 1);
        handle.setListObject(
          state.listObject.map((item) =>
            item.unitID === unitID
              ? {
                  ...item,
                  pages: item.pages.map((subItem) =>
                    subItem.pageID > pageID
                      ? { ...subItem, pageID: subItem.pageID - 1 }
                      : subItem
                  )
                }
              : item
          )
        );
      }
    });
  };

  const listSelected = (unitID, pageID) => handle.setListObject(
    state.listObject.map((item) =>
      item.unitID === unitID
        ? {
            ...item,
            selected: true,
            pages: item.pages.map((subItem) =>
              subItem.pageID === pageID
                ? { ...subItem, selected: true }
                : subItem
            )
          }
        : item
    )
  );

  const pageClick = (unitID, pageID) => {
    // clear the previous selected state first
    let prevUnit = state.listObject.find((item) => item.selected),
      prevPage;
    if (prevUnit) {
      prevUnit.selected = false;
      prevPage = prevUnit.pages.find((item) => item.selected);
    }
    if (prevPage) {
      const samePage = prevUnit.unitID === unitID && prevPage.pageID === pageID;
      prevPage.route = samePage ? state.route : state.route < 4 ? state.route : 1;
      prevPage.selected = false;
      if (!samePage && state.route === routeIndex.recall)
        handle.submitRecall(prevUnit.unitID, prevPage.pageID);
    }
    if (state.navListMobile) handle.closeNavListMobile();
    if (state.listObject[unitID - 1].pages[pageID - 1].route === routeIndex.stat)
      packedGET({
        uri: "/data/stat",
        query: {
          userID: data.userID,
          unitID: unitID,
          pageID: pageID,
        },
        msgbox: handle.toggleMessageBox,
        kick: handle.toggleKick,
        lang: lang
      }).then((out) => {
        handle.setStatInfo(out);
        listSelected(unitID, pageID)
      });
    else listSelected(unitID, pageID);
  };

  return (
    <div className={classes.newPage}>
      {state.listObject.length !== 0 ? (
        <List component="nav" className={classes.list}>
          {state.listObject.map((item, index) => (
            <div key={index}>
              <ListItem
                onContextMenu={(event) => toggleUnitMenu(event, item.unitID)}
                button
                onClick={() => changeUnit(item.unitID)}
              >
                <ListItemIcon>
                  <ListIcon />
                </ListItemIcon>
                <ListItemText primary={item.unitName} />
                {item.open ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={item.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.pages.map((subItem, subIndex) => (
                    <ListItem
                      selected={subItem.selected}
                      key={subIndex}
                      onContextMenu={(event) =>
                        togglePageMenu(event, item.unitID, subItem.pageID)
                      }
                      onClick={() => pageClick(item.unitID, subItem.pageID)}
                      button
                      className={classes.nested}
                    >
                      <ListItemIcon>
                        {subItem.pageCover < pageIcon().length
                          ? pageIcon()[subItem.pageCover] : pageIcon()[0]}
                      </ListItemIcon>
                      <ListItemText primary={subItem.pageName} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </div>
          ))}
          <UnitMenu
            lang={lang}
            state={{
              unitMenu: unitMenu,
              unitID: currentUnitID,
              fold: currentFold,
              top: currentTop,
              buttom: currentButtom
            }}
            handle={{
              toggleNewUnit: (pos) => toggleNewUnitPage(true, pos),
              toggleDeleteConfirm: toggleDeleteConfirm,
              toggleEditUnit: toggleEditUnit,
              closeMenu: () => setUnitMenu(initMenu),
              changeUnit: changeUnit,
              moveUnit: (less) => changeMove(true, less)
            }}
          />
          <PageMenu
            lang={lang}
            state={{
              pageMenu: pageMenu,
              unitID: currentUnitID,
              pageID: currentPageID,
              top: currentTop,
              buttom: currentButtom
            }}
            handle={{
              toggleNewPage: (pos, edit) => toggleNewUnitPage(false, pos, edit),
              toggleDeleteConfirm: toggleDeleteConfirm,
              closeMenu: () => setPageMenu(initMenu),
              movePage: (less) => changeMove(false, less)
            }}
          />
        </List>
      ) : (
        <div className={clsx(classes.newPage, classes.center)}>
          <IconButton onClick={() => toggleNewUnitPage(true, 0)}>
            <AddIcon fontSize="large" />
          </IconButton>
          <Typography variant="button" color="textSecondary" align="center">
            {lang.panel.initUnit}
          </Typography>
        </div>
      )}
      <NewUnitPage
        lang={lang}
        userID={data.userID}
        token={data.token}
        edit={edit}
        open={newUnitPage}
        group={newUnitPageGroup}
        type={newUnitPageType}
        text={{
          listObject: state.listObject,
          unitNameValue: newUnitNameValue,
          pageNameValue: newPageNameValue,
          pagePresentValue: newPagePresentValue,
          unitNameCheck: newUnitNameCheck,
          pageNameCheck: newPageNameCheck,
          pagePresentCheck: newPagePresentCheck
        }}
        handle={{
          setListObject: handle.setListObject,
          setUnitNameValue: setNewUnitNameValue,
          setPageNameValue: setNewPageNameValue,
          setPagePresentValue: setNewPagePresentValue,
          setUnitNameCheck: setNewUnitNameCheck,
          setPageNameCheck: setNewPageNameCheck,
          setPagePresentCheck: setNewPagePresentCheck,
          toggleMessageBox: handle.toggleMessageBox,
          toggleKick: handle.toggleKick,
          close: () => setNewUnitPage(false)
        }}
      />
      <EditUnit
        lang={lang}
        open={editUnit}
        userID={data.userID}
        state={{
          name: currentName,
          unitID: currentUnitID,
          editUnitNameValue: editUnitNameValue,
          editUnitNameCheck: editUnitNameCheck
        }}
        handle={{
          toggleMessageBox: handle.toggleMessageBox,
          toggleKick: handle.toggleKick,
          setEditUnitNameValue: setEditUnitNameValue,
          setEditUnitNameCheck: setEditUnitNameCheck,
          setListObject: handle.setListObject,
          close: () => setEditUnit(false)
        }}
      />
      <DeleteConfirm
        lang={lang}
        open={deleteConfirm}
        type={deleteConfirmType}
        name={currentName}
        handleClose={() => setDeleteConfirm(false)}
        handleDeleteTarget={() =>
          deleteUnitPage(data.userID, currentUnitID, currentPageID)
        }
      />
    </div>
  );
}
