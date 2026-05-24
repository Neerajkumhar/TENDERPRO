const User = require('./models/User');
const Department = require('./models/Department');

async function testUpdate() {
  try {
    const id = '6e31b4b0-1a0f-4880-ba13-c3e8e405de78';
    const user = await User.findByPk(id);
    if (!user) {
      console.log('Member not found');
      return;
    }

    const updateData = {
      name: 'Test Name',
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      phone: user.phone,
      image: user.image,
      status: user.status
    };

    await user.update(updateData);
    console.log('Update successful');
  } catch (err) {
    console.error('FULL ERROR:', err);
  }
}

testUpdate();
