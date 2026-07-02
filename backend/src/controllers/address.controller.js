import Address from '../models/Address.js';

export const getDefaultAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const address = await Address.findOne({ user_id: userId, is_default: true });
    return res.status(200).json({ data: address });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const saveDefaultAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, phone, line1, ward, district, city } = req.body;

    let address = await Address.findOne({ user_id: userId });
    if (!address) {
      address = new Address({ user_id: userId, is_default: true });
    }

    address.full_name = full_name;
    address.phone = phone;
    address.line1 = line1;
    address.ward = ward || '';
    address.district = district || '';
    address.city = city || '';

    await address.save();

    return res.status(200).json({ success: true, id: address._id.toString() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
