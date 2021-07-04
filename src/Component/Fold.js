import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";

import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  menuButton: {marginRight: theme.spacing(2)}
}));

export default function Fold(props) {
  const classes = useStyles();
  const {navList, handleToggleNavList, handleCloseNavList} = props;

  return (
    <IconButton
      color="inherit"
      edge="start"
      className={classes.menuButton}
      onClick={navList ? handleCloseNavList : handleToggleNavList}
    >
      {navList ? (<ChevronLeftIcon />) : (<MenuIcon />)}
    </IconButton>
  );
}