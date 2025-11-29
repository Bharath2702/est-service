const utils = require("../lib/utils");
import Sequelize from "sequelize";
import User from "../database/models/Users";

const Op = Sequelize.Op;
const { Validator } = require("node-input-validator");

class UserController {
  constructor() {}

  public async register(req: any, res: any) {
    try {
      const payload = req.body;
      const validatorRules = {
        id: "required|nullable",
        code: "required",
        name: "required",
        userName: "required",
        mobileNumber: "required|numeric|minLength:10|maxLength:10",
        email: "email",
        password: "required|nullable",
        designationCode: "required|string",
        reportingId: "required|string|nullable",
        roles: "required|array",
        active: "required|nullable",
      };

      const v = new Validator(payload, validatorRules);
      const matched = await v.check();

      if (!matched) {
        res.status(422).send(v.errors);
      } else {
        if (payload.id === null || payload.id === undefined) {
          User.findOne({
            where: {
              [Op.or]: [
                { code: payload.code },
                { userName: payload.userName },
                { mobileNumber: payload.mobileNumber },
                { email: payload.email },
              ],
            },
          })
            .then(async (userFound: any) => {
              let userPwd = null;
              if (req.body.password === null || req.body.password === "") {
                userPwd = "Test@123";
              } else {
                userPwd = req.body.password;
              }
              const saltHash = utils.genPassword(userPwd);
              if (!userFound) {
                let user: any = {
                  code: payload.code,
                  name: payload.name,
                  mobileNumber: payload.mobileNumber,
                  userName: payload.userName,
                  email: payload.email,
                  password: saltHash.hash,
                  designationCode: payload.designationCode,
                  salt: saltHash.salt,
                  active: payload.active,
                };

                const newUser = await User.create(user);

                newUser
                  .save()
                  .then(async (newUsers: any) => {
                    
                    return res.json({
                      success: true,
                      message: "Successfully Registered!",
                    });
                  })
                  .catch((err: any) => {
                    return res
                      .status(500)
                      .json({ success: false, message: err });
                  });
              } else {
                return res.status(200).json({
                  success: false,
                  message: "User Already Exists Please Login",
                });
              }
            })
            .catch((err: any) => {
              return res.status(500).json({ success: false, message: err });
            });
        } else {
          User.findOne({
            where: {
              id: {
                [Op.not]: payload.id,
              },
              [Op.or]: [
                { code: payload.code },
                { userName: payload.userName },
                { mobileNumber: payload.mobileNumber },
                { email: payload.email },
              ],
            },
          }).then(async (userFound: any) => {
            if (!userFound) {
              let userPwd = false;
              if (req.body.password === null || req.body.password === "") {
                userPwd = false;
              } else {
                userPwd = true;
              }
              let user: any = {
                code: payload.code,
                name: payload.name,
                mobileNumber: payload.mobileNumber,
                userName: payload.userName,
                email: payload.email,
                designationCode: payload.designationCode,
                active: payload.active,
              };
              if (userPwd) {
                const saltHash = utils.genPassword(req.body.password);
                user = {
                  code: payload.code,
                  name: payload.name,
                  mobileNumber: payload.mobileNumber,
                  userName: payload.userName,
                  email: payload.email,
                  password: saltHash.hash,
                  designationCode: payload.designationCode,
                  salt: saltHash.salt,
                  active: payload.active,
                };
              }

              try {
                // Corrected update syntax
                await User.update(user, { where: { id: payload.id } });

                
                return res.status(200).json({
                  success: true,
                  message: "User Updated Successfully",
                });
              } catch (err) {
                return res.status(500).json({ success: false, message: err });
              }
            } else {
              let exists: any = [];
              if (userFound.code === payload.code) {
                exists.push("Code");
              }
              if (userFound.userName === payload.userName) {
                exists.push("Username");
              }
              if (userFound.mobileNumber === payload.mobileNumber) {
                exists.push("Mobile Number");
              }
              if (userFound.email === payload.email) {
                exists.push("Email");
              }
              let text = exists.join(", ");

              return res.status(200).json({
                success: false,
                message: `Values already exist: ${text}`,
              });
            }
          });
        }
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: err });
    }
  }

  public async login(req: any, res: any) {
    try {
      const payload = req.body;
      const validatorRules = {
        userName: "required",
        password: "string",
      };
      const v = new Validator(payload, validatorRules);
      const matched = await v.check();
      if (!matched) {
        res.status(422).send(v.errors);
      } else {
        User.findOne({
          where: {
            [Op.or]: [
              { userName: payload.userName },
              { mobileNumber: payload.userName },
              { email: payload.userName },
            ],
          },
        })
          .then(async (user: any) => {
            if (!user) {
              // No user found with the provided username
              return res
                .status(200)
                .json({ success: false, message: "Username is incorrect" });
            }

            // Check if the password is correct
            const isValidPassword = utils.validPassword(
              req.body.password,
              user.password,
              user.salt
            );

            if (isValidPassword) {
              // Both username and password are correct
              
              let roleArray: any = [];
              let permission: any = [];
              
              

              const tokenObject = utils.issueJWT(user);
              let response: any = {
                success: true,
                message: "Login successfully",
                user: user,
                expiresIn: tokenObject.expires,
                roles: roleArray,
                permissions: permission,
                token: tokenObject.token,
              };
              return res.status(200).json(response);
            } else {
              // Password is incorrect
              return res
                .status(200)
                .json({ success: false, message: "Password is incorrect" });
            }
          })
          .catch((err: any) => {
            throw err;
          });
      }
    } catch (err: any) {
      throw err;
    }
  }

  public async logout(req: any, res: any) {
    try {
      let result = utils.inValidateToken(req.headers["authorization"]);
      if (result) {
        return res.status(200).json({
          success: true,
          messgae: "You have been logged out",
        });
      } else {
        return res.status(500).json({
          success: false,
          messgae: "OOPS! Something went wrong",
        });
      }
    } catch (err: any) {
      throw err;
    }
  }

  
}
const userController = new UserController();
export default userController;
