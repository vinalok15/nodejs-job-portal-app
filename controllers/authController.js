import User from '../models/User.js';

//Register Methods
export const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //validate
    if (!name) next('Name is requried.');
    if (!email) next('Email is requried.');
    if (!password) next('Password is requried');

    const exisitingUser = await User.findOne({ email });
    if (exisitingUser) {
      return res.status(200).send({
        success: true,
        message: 'Email already exists.',
      });
    }
    const user = await User.create({ name, email, password });

    //TOKEN
    const token = user.createJWT();
    return res.status(201).send({
      success: true,
      message: 'User created successfully.',
      user: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;

  //validation
  if (!email || !password) {
    return next('Please provide all fields');
  }

  //find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next('Invalid Username or Password.');
  }

  //compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next('Invalid Username or password2');
  }

  user.password = undefined;
  const token = user.createJWT();

  res.status(200).json({
    success: true,
    message: 'Login Successfully.',
    user,
    token,
  });
};
