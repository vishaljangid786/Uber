const userModel = require("../models/user.model");

module.exports.createUser = async ({ fullname, email, password }) => {
  if (!fullname?.firstname || !email || !password) {
    throw new Error("Required fields are missing");
  }

  const user = await userModel.create({
    fullname: {
      firstname: fullname.firstname,
      lastname: fullname.lastname,
    },
    email,
    password,
  });

  return user;
};
