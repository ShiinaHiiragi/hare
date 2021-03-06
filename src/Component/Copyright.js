import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import License from "../Dialogue/License";

export default function Copyright(props) {
  const { lang, handleToggleMessageBox } = props;
  // the license information popup
  const [license, setLicense] = React.useState(false);

  return (
    <Box mt={5}>
      <Typography variant="body2" color="textSecondary" align="center">
        {`${lang.signIn.copyright} ©`}
        <Link color="inherit" href="#" onClick={() => setLicense(true)}>
          HARE
        </Link>
        {` ${new Date().getFullYear()}`}
      </Typography>
      <License
        lang={lang}
        open={license}
        handleClose={() => setLicense(false)}
        handleToggleMessageBox={handleToggleMessageBox}
      />
    </Box>
  );
}
