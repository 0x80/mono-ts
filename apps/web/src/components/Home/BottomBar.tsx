import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    padding: "16px",
    backgroundColor: theme.palette.primary.main,
    [theme.breakpoints.down("md")]: {
      padding: "5px",
    },
  },
  container: {
    marginTop: "64px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
    gap: theme.spacing(12), // spacing between grid items
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "1fr", // 1 column on mobile
    },
    marginBottom: "64px",
  },
  logoContainer: {
    alignSelf: "stretch",
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
    },
    marginTop: "5px",
  },
  logo: {
    width: "160px",

    maxWidth: "100%",
    aspectRatio: "3.33",
    margin: "0 auto",
    [theme.breakpoints.down("md")]: {
      marginTop: "10px",
    },
  },
  menuContainer: {
    display: "flex",
    flexDirection: "column",
    width: "73%",
    marginLeft: "5px",
    [theme.breakpoints.down("md")]: {
      marginLeft: "0",
      width: "100%",
    },
  },
  menuItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",

    flexGrow: 1,
    padding: "5px",
    backgroundColor: theme.palette.primary.main,
    [theme.breakpoints.down("md")]: {
      padding: "5px",
      marginTop: "10px",
    },
  },
  menuItemText: {
    fontSize: "xl",
    fontWeight: "bold",
    color: "white",
    textAlign: "start",
    marginBottom: "12px",
    [theme.breakpoints.down("md")]: {
      padding: "7px",
    },
  },
  socialIconsContainer: {
    display: "flex",
    gap: "24px",
    marginTop: "10px",
    [theme.breakpoints.down("md")]: {
      marginTop: "10px",
    },
  },
  socialIcon: {
    width: "50px",
    aspectRatio: "1",
    marginRight: "5px",
    "&:last-child": {
      marginRight: "0",
    },
  },
  contactInfo: {
    fontSize: "xl",
    fontWeight: "medium",
    color: "white",
    textAlign: "center",
    marginTop: "24px",
    [theme.breakpoints.down("md")]: {
      marginTop: "10px",
    },
  },
  copyRight: {
    fontSize: "xl",
    fontWeight: "medium",
    color: "white",
    textAlign: "center",
    marginTop: "4px",
    [theme.breakpoints.down("md")]: {
      marginTop: "10px",
    },
  },
}));

export default function BottomBar() {
  const { classes } = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.logoContainer}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/dcaa3c527171d8201a645f07d34c6701c351ee6785042b10ed24bd14080d23b1?apiKey=851057bcf5b3427b821ed90e5714ffa1&"
            className={classes.logo}
          />
        </div>
        <div className={classes.menuContainer}>
          <div className={classes.menuItem}>
            <div className={classes.menuItemText}>Acerca de</div>
            <div className={classes.menuItemText}>Términos y condiciones</div>
            <div className={classes.menuItemText}>Privacidad</div>
            <div className={classes.menuItemText}>
              <a href="https://calendar.app.google/VZ588xZCz9b8KPk57">
                Contacto
              </a>
            </div>
          </div>
        </div>
        <div className={classes.menuContainer}>
          <div className={classes.socialIconsContainer}>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f39c7fae4b8e40b22898aa08ce4cc7c1a40993ff8138a060a52b31c98dea2309?apiKey=851057bcf5b3427b821ed90e5714ffa1&"
              className={classes.socialIcon}
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c75fde1ade72f6256e9806dce07115e5a07c60116181f799887d7fb7fba42959?apiKey=851057bcf5b3427b821ed90e5714ffa1&"
              className={classes.socialIcon}
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/3c0bac996f34e31d8de78b98188da452f5ab52f3d3fe928d8b0be87548dcfae7?apiKey=851057bcf5b3427b821ed90e5714ffa1&"
              className={classes.socialIcon}
            />
          </div>
          <div className={classes.contactInfo}>leon@byearly.com</div>
        </div>
      </div>
      <div className={classes.copyRight}>© 2024 Early</div>
      <div className={classes.copyRight}>Chile</div>
    </div>
  );
}
