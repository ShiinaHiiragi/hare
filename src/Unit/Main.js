import React from "react";
import clsx from "clsx";
import Header from "../Interface/Header";
import { drawerWidth } from "../Interface/Constant";
import MainPage from "../Interface/MainPage";
import Intro from "../Component/Intro";
import Cover from "../Component/Cover";
import View from "../Component/View";
import Recall from "../Component/Recall";
import packedGET from "../Interface/Request";
import { routeIndex } from "../Interface/Constant";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  content: {
    userSelect: "none",
    height: "100vh",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }
}));

export default function Main(props) {
  const classes = useStyles();
  const { lang, data, state, handle } = props;
  const [itemList, setItemList] = React.useState([]);

  const [timerInitial, setTimerInitial] = React.useState(0);
  const [pageDetail, setPageDetail] = React.useState({
    pageCreateTime: "2019-12-31T16:00:00.000Z",
    itemSize: 0,
    trackSize: 0,
    timeThis: null
  });

  React.useEffect(() => {
    if (state.current.unitID && state.current.pageID)
      packedGET({
        uri: "/data/page",
        query: {
          userID: data.userID,
          unitID: state.current.unitID,
          pageID: state.current.pageID
        },
        msgbox: handle.toggleMessageBox,
        kick: handle.toggleKick,
        lang: lang
      }).then((out) => {
        setPageDetail({
          itemSize: out.itemsize,
          trackSize: out.tracksize,
          pageCreateTime: out.pagecreatetime,
          timeThis: out.timethis && true
        });
      });
  }, [state.current.unitID, state.current.pageID]);

  React.useEffect(() => {
    if (state.current.unitID && state.current.pageID)
      packedGET({
        uri: "/data/item",
        query: {
          userID: data.userID,
          unitID: state.current.unitID,
          pageID: state.current.pageID
        },
        msgbox: handle.toggleMessageBox,
        kick: handle.toggleKick,
        lang: lang
      }).then((out) => setItemList(out));
  }, [state.current.unitID, state.current.pageID]);

  return (
    <main
      className={clsx(classes.content, {
        [classes.contentShift]: state.navList
      })}
    >
      <Header />
      <MainPage index={routeIndex.intro} route={state.current.route}>
        <Intro lang={lang} />
      </MainPage>
      <MainPage index={routeIndex.cover} route={state.current.route}>
        <Cover
          lang={lang}
          data={{
            userID: data.userID,
            token: data.token,
            current: state.current,
            pageDetail: pageDetail,
          }}
          handle={{
            setCurrentRoute: handle.setCurrentRoute,
            toggleMessageBox: handle.toggleMessageBox,
            toggleKick: handle.toggleKick,
            setRecall: handle.setRecall,
            setTimerInitial: setTimerInitial,
            setPageDetail: setPageDetail
          }}
        />
      </MainPage>
      <MainPage index={routeIndex.view} route={state.current.route}>
        <View
          lang={lang}
          current={state.current}
          data={{
            userID: data.userID,
            token: data.token,
            pageDetail: pageDetail,
            itemList: itemList
          }}
          handle={{
            toggleMessageBox: handle.toggleMessageBox,
            toggleKick: handle.toggleKick,
            setCurrentRoute: handle.setCurrentRoute,
            setPageDetail: setPageDetail,
            setItemList: setItemList
          }}
        />
      </MainPage>
      {/* TODO: statistics panel */}
      <MainPage index={routeIndex.stat} route={state.current.route}>
        3 - Statistics
      </MainPage>
      <MainPage index={routeIndex.recall} route={state.current.route}>
        <Recall
          lang={lang}
          data={{
            recall: state.recall,
            itemList: itemList,
            route: state.current.route,
            unitID: state.current.unitID,
            pageID: state.current.pageID,
            timerInitial: timerInitial
          }}
          handle={{
            setCurrentRoute: handle.setCurrentRoute,
            setRecall: handle.setRecall,
            submitRecall: handle.submitRecall
          }}
        />
      </MainPage>
      {/* TODO: ranking panel */}
      <MainPage index={routeIndex.rank} route={state.current.route}>
        5 - Ranking
      </MainPage>
    </main>
  );
}
