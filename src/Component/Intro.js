import React from "react";
import Typography from "@material-ui/core/Typography";
import IntroGraph from "../Interface/intro.png";

import makeStyles from "@material-ui/core/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  graph: {
    maxWidth: "200px",
    maxHeight: "200px",
    paddingBottom: theme.spacing(2)
  }
}));

// get a number randomly in [sub, sup];
const dice = (sub, sup) => {
  return Math.round(Math.random() * (sup - sub) + sub);
};

const Intro = React.memo((props) => {
  const classes = useStyles();
  const { lang } = props;
  const captions = lang.panel.intro;

  return (
    <div className={classes.root}>
      <img src={IntroGraph} alt="" className={classes.graph} />
      <Typography variant="body2" color="textSecondary" align="center" style={{ maxWidth: "90%" }}>
        {captions[dice(0, captions.length - 1)]}
      </Typography>
    </div>
  );
});

export default Intro;
