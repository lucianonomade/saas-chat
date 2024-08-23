import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";

import Routes from "./routes";
import useSettings from "./hooks/useSettings";

const defaultLogoLight = "assets/vector/logo.svg";
const defaultLogoDark = "assets/vector/logo-dark.svg";
const defaultLogoFavicon = "assets/vector/favicon.svg";

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

    const [primaryColorLight, setPrimaryColorLight] = useState("#F3F3F3");
    const [primaryColorDark, setPrimaryColorDark] = useState("#333333");
    const [appLogoLight, setAppLogoLight] = useState("");
    const [appLogoDark, setAppLogoDark] = useState("");
    const [appLogoFavicon, setAppLogoFavicon] = useState("");
    const [appName, setAppName] = useState("");

    const [chatlistLight, setChatlistLight] = useState("#FFFFFF");
    const [chatlistDark, setChatlistDark] = useState("#999999");
    const [boxRightLight, setBoxRightLight] = useState("#39ACE7");
    const [boxRightDark, setBoxRightDark] = useState("#39ACE7");
    const [boxLeftLight, setBoxLeftLight] = useState("#39ACE7");
    const [boxLeftDark, setBoxLeftDark] = useState("#39ACE7");

    const { getPublicSetting } = useSettings();

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },

            setPrimaryColorLight: (color) => {
                if (!color || !color.startsWith("#")) {
                    color = "#0000FF";
                }
                setPrimaryColorLight(color);
            },
            setPrimaryColorDark: (color) => {
                setPrimaryColorDark(color);
            },
            setAppLogoLight: (file) => {
                setAppLogoLight(file);
            },
            setAppLogoDark: (file) => {
                setAppLogoDark(file);
            },
            setAppLogoFavicon: (file) => {
                setAppLogoFavicon(file);
            },
            setAppName: (name) => {
                setAppName(name);
            },
            setChatlistLight: (color) => {
                setChatlistLight(color);
            },
            setChatlistDark: (color) => {
                setChatlistDark(color);
            },
            setBoxLeftLight: (color) => {
                setBoxLeftLight(color);
            },
            setBoxLeftDark: (color) => {
                setBoxLeftDark(color);
            },
            setBoxRightLight: (color) => {
                setBoxRightLight(color);
            },
            setBoxRightDark: (color) => {
                setBoxRightDark(color);
            }

        }),
        []
    );

    const theme = createTheme(
        {
            // scrollbarStyles: {
            //     "&::-webkit-scrollbar": {
            //         width: '8px',
            //         height: '8px',
            //     },
            //     "&::-webkit-scrollbar-thumb": {
            //         boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
            //         backgroundColor: "#00BFFF",
            //     },
            // },
            // scrollbarStylesSoft: {
            //     "&::-webkit-scrollbar": {
            //         width: "8px",
            //     },
            //     "&::-webkit-scrollbar-thumb": {
            //         backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
            //     },
            // },

            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: '8px',
                    height: '8px',
                    borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
                    backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
                    borderRadius: "8px",
                },
            },
            scrollbarStylesSoft: {
                "&::-webkit-scrollbar": {
                    width: "8px",
                    borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: mode === "light" ? "##000000" : "#fff !important",
                    borderRadius: "8px",
                },
            },

        

             palette: {
                 type: mode,
                 primary: { main: "#000000" },
                 textPrimary: mode === "light" ? "#000000" : "#FFFFFF",
                 borderPrimary: mode === "light" ? "#000000F" : "#FFFFFF",
                 dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
                 light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
                 tabHeaderBackground: mode === "light" ? "#EEE" : "#333",
                 optionsBackground: mode === "light" ? "#fafafa" : "#333",
                 options: mode === "light" ? "#fafafa" : "#666",
                 fontecor: mode === "light" ? "##000000" : "#fff",
                 fancyBackground: mode === "light" ? "#fafafa" : "#333",
                 bordabox: mode === "light" ? "#eee" : "#333",
                 newmessagebox: mode === "light" ? "#eee" : "#333",
                 inputdigita: mode === "light" ? "#fff" : "#333",
                 contactdrawer: mode === "light" ? "#fff" : "#333",
                 announcements: mode === "light" ? "#ededed" : "#333",
                 login: mode === "light" ? "#fff" : "#1C1C1C",
                 announcementspopover: mode === "light" ? "#fff" : "#333",
             chatlist: mode === "light" ? "#eee" : "#333",
                 boxlist: mode === "light" ? "#ededed" : "#333",
                 boxchatlist: mode === "light" ? "#ededed" : "#333",
                 total: mode === "light" ? "#fff" : "#222",
                 messageIcons: mode === "light" ? "grey" : "#F3F3F3",
                 inputBackground: mode === "light" ? "#FFFFFF" : "#333",
                 barraSuperior: mode === "light" ? "linear-gradient(to right, #000000, #000000, #000000)" : "#666",
                 boxticket: mode === "light" ? "#EEE" : "#333",
                 campaigntab: mode === "light" ? "#ededed" : "#333",
                 drawerIcons: mode === "light" ? "#000000" : "inherit",
                 drawerBackground: mode === "light" ? "##fff" : "#333",
                 drawerText: mode === "light" ? "#000000" : "#fff",

                 // background: '#10175b',
              // color: 'white',

             },
            mode,
            appLogoDark,
            appLogoLight,
            appLogoFavicon,
            appName,
            chatlistLight,
            chatlistDark,
            boxLeftLight,
            boxLeftDark,
            boxRightLight,
            boxRightDark,
            calculatedLogoDark: () => {
                if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
                    return appLogoLight;
                }
                return appLogoDark;
            },
            calculatedLogoLight: () => {
                if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
                    return appLogoDark;
                }
                return appLogoLight;
            }
        },
        locale
    );

    useEffect(() => {
        const i18nlocale = localStorage.getItem("i18nextLng");
        const browserLocale =
            i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

        if (browserLocale === "ptBR") {
            setLocale(ptBR);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("preferredTheme", mode);
    }, [mode]);



    useEffect(() => {

        // console.log("AppLogoFavicon");

        getPublicSetting("primaryColorLight")
            .then((color) => { setPrimaryColorLight(color || "#0000FF") })
            .catch((error) => { console.log("Error reading setting", error); });
        getPublicSetting("primaryColorDark")
            .then((color) => { setPrimaryColorDark(color || "#39ACE7") })
            .catch((error) => { console.log("Error reading setting", error); });
        getPublicSetting("appLogoLight")
            .then((file) => { setAppLogoLight(file ? (process.env.REACT_APP_BACKEND_URL + "/public/" + file) : defaultLogoLight) }, (_) => { })
            .catch((error) => { console.log("Error reading setting", error); });
        getPublicSetting("appLogoDark")
            .then((file) => { setAppLogoDark(file ? (process.env.REACT_APP_BACKEND_URL + "/public/" + file) : defaultLogoDark) })
            .catch((error) => { console.log("Error reading setting", error); });
        getPublicSetting("appLogoFavicon")
            .then((file) => { setAppLogoFavicon(file ? (process.env.REACT_APP_BACKEND_URL + "/public/" + file) : defaultLogoFavicon) })
            .catch((error) => { console.log("Error reading setting", error); });
        getPublicSetting("chatlistLight").then((color) => {
            if (!color || !color.startsWith("#")) {
                color = "#eeeeee";
            }
            setChatlistLight(color)
        }, (_) => { });
        getPublicSetting("chatlistDark").then((color) => {
            if (!color || !color.startsWith("#")) {
                color = "#1C2E36";
            }
            setChatlistDark(color)
        }, (_) => { });
        getPublicSetting("boxRightLight").then((color) => {
            if (!color || !color.startsWith("#")) {
                color = "#39ACE7";
            }
            setBoxRightLight(color)
        }, (_) => { });
        getPublicSetting("boxRightDark").then((color) => {
            if (!color || !color.startsWith("#")) {
                color = "#39ACE7";
            }
            setBoxRightDark(color)
        }, (_) => { });
        getPublicSetting("boxLeftLight").then((color) => {
            if (!color || !color.startsWith("#")) {
                color = "#39ACE7";
            }
            setBoxLeftLight(color)
        }, (_) => { });
        getPublicSetting("boxLeftDark").then((color) => {
            if (!color || !color.startsWith("#")) {
                color = "#39ACE7";
            }
            setBoxLeftDark(color)
        }, (_) => { });
    }, [getPublicSetting]);


    return (
        <ColorModeContext.Provider value={{ colorMode }}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <Routes />
                </QueryClientProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
