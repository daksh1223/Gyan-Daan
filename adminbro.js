const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");
const rootPath = "/admin";
AdminBro.registerAdapter(AdminBroMongoose);
const router_builder = (connection) => {
  const adminBro = new AdminBro({
    databases: [connection],
    rootPath: rootPath,
  });
  return (router = AdminBroExpress.buildRouter(adminBro));
};
const admin_checker = (req, res, next) => {
  if (req.user.isAdmin) next();
  else res.render("permission_denied");
};
module.exports = { rootPath, router_builder, admin_checker };
