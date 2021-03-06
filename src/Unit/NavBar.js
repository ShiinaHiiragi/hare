import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Hidden from "@material-ui/core/Hidden";
import LocalInfo from "../Component/LocalInfo";
import NavTitle from "../Component/NavTitle";
import Fold from "../Component/Fold";
import { drawerWidth } from "../Interface/Constant";
import clsx from "clsx";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  appBar: {
    userSelect: "none",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  }
}));

export default function NavBar(props) {
  const classes = useStyles();
  const { state, handle } = props;

  const AppBarContent = (
    <Toolbar>
      <Fold
        navList={state.navList}
        handle={{
          toggleNavList: handle.toggleNavList,
          closeNavList: handle.closeNavList,
          toggleNavListMobile: handle.toggleNavListMobile
        }}
      />
      <NavTitle title={state.currentSelect.pageName} />
      {state.currentSelect.unitID &&
      <LocalInfo
        current={state.currentSelect}
        handleSetList={handle.setListObject}
      />}
    </Toolbar>
  );

  return (
    <div>
      <Hidden smDown implementation="css">
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: state.navList
          })}
        >
          {AppBarContent}
        </AppBar>
      </Hidden>
      <Hidden mdUp implementation="css">
        <AppBar position="fixed" className={classes.appBar}>
          {AppBarContent}
        </AppBar>
      </Hidden>
    </div>
  );
}
