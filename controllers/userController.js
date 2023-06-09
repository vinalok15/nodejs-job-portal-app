import User from '../models/User.js';

export const updateUserController = async (req, res, next) => {
  const { name, email, lastName, location } = req.body;
  if (!name || !email || !lastName || !location) {
    next('Please provide all fields');
  }

  //const user = await User.findOne({ _id: req.user.userId });

  const user = await User.findById(req.user.userId);
  console.log(user);

  user.name = name;
  // user.lastName = lastName;
  user.email = email;
  user.location = location;
  await user.save();

  //console.log(user);

  //const token = user.createJWT();

  const token = '12345';

  return res.status(200).json({
    user,
    token,
  });
};
