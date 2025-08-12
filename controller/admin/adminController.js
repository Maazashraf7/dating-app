const AdminUser = require('../../model/admin/adminUser');

exports.adminRegister = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { email, password } = req.body;

    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const newAdmin = new AdminUser({ email, password });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin user registered successfully' });
  } catch (error) {
    console.error('Error registering admin user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

