const Router = (server) => {
    server.get("/task manager", (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                data: [],
                message: "Welcome to our Web App homepage",
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    })
};
export default Router;