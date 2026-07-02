import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import ProductImage from '../models/ProductImage.js';
import Voucher from '../models/Voucher.js';

export const seedProductsAndCategories = async () => {
  try {
    // 1. Seed Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('Categories already seeded. Skipping...');
      return;
    }

    console.log('Seeding Categories...');
    const categoriesData = [
      { name: 'Điện thoại', slug: 'phone', sort_order: 1 },
      { name: 'Laptop', slug: 'laptop', sort_order: 2 },
      { name: 'Tablet', slug: 'tablet', sort_order: 3 },
      { name: 'Tai nghe', slug: 'headphone', sort_order: 4 },
      { name: 'Phụ kiện', slug: 'accessories', sort_order: 5 }
    ];
    const categories = await Category.create(categoriesData);
    const catMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {});

    console.log('Seeding Products, Variants and Images...');
    
    // Helper to add product, variants and images
    const createProductWithDetails = async (productData, variantsData, imagesData) => {
      const product = await Product.create(productData);
      
      const variants = variantsData.map(v => ({ ...v, product_id: product._id }));
      await ProductVariant.create(variants);

      const images = imagesData.map(img => ({ ...img, product_id: product._id }));
      await ProductImage.create(images);
      
      return product;
    };

    // 1.1 iPhone 15 Pro Max
    await createProductWithDetails(
      {
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        sku: 'IPHONE15PM',
        description: 'iPhone 15 Pro Max sở hữu khung titan chuẩn vũ trụ, chip A17 Pro đột phá, nút Tác vụ có thể tùy chỉnh và hệ thống camera chất lượng nhất.',
        product_img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
        brand: 'Apple',
        category_id: catMap['phone'],
        is_active: true
      },
      [
        { variant_sku: 'IPHONE15PM-TITAN', color: 'Titan Tự Nhiên', size: '256GB', price: 29990000, compare_price: 34990000, weight: 0.22 },
        { variant_sku: 'IPHONE15PM-BLACK', color: 'Titan Đen', size: '256GB', price: 28990000, compare_price: 34990000, weight: 0.22 },
        { variant_sku: 'IPHONE15PM-BLUE', color: 'Titan Xanh', size: '256GB', price: 28990000, compare_price: 34990000, weight: 0.22 }
      ],
      [
        { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop', is_primary: true, sort_order: 1 },
        { url: 'https://images.unsplash.com/photo-1695048132958-3d5f9923be2a?q=80&w=600&auto=format&fit=crop', is_primary: false, sort_order: 2 }
      ]
    );

    // 1.2 Samsung Galaxy S24 Ultra
    await createProductWithDetails(
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        sku: 'SAMS24U',
        description: 'Mở ra kỷ nguyên AI trên điện thoại với Galaxy S24 Ultra. Khung titan cao cấp, bút S Pen huyền thoại và camera 200MP zoom quang học 5x cực đỉnh.',
        product_img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
        brand: 'Samsung',
        category_id: catMap['phone'],
        is_active: true
      },
      [
        { variant_sku: 'SAMS24U-GREY', color: 'Xám Titan', size: '256GB', price: 27990000, compare_price: 31990000, weight: 0.23 },
        { variant_sku: 'SAMS24U-YELLOW', color: 'Vàng Titan', size: '256GB', price: 27990000, compare_price: 31990000, weight: 0.23 }
      ],
      [
        { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop', is_primary: true, sort_order: 1 }
      ]
    );

    // 2.1 MacBook Air M3
    await createProductWithDetails(
      {
        name: 'MacBook Air 13 inch M3 2024',
        slug: 'macbook-air-13-inch-m3-2024',
        sku: 'MBAIRM3',
        description: 'MacBook Air M3 mang đến hiệu năng vượt trội trong thiết kế mỏng nhẹ không tưởng. Thời lượng pin lên tới 18 giờ liên tục.',
        product_img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
        brand: 'Apple',
        category_id: catMap['laptop'],
        is_active: true
      },
      [
        { variant_sku: 'MBAIRM3-GREY', color: 'Xám Không Gian', size: '8GB/256GB', price: 26990000, compare_price: 27990000, weight: 1.24 },
        { variant_sku: 'MBAIRM3-SILVER', color: 'Bạc', size: '16GB/512GB', price: 32990000, compare_price: 34990000, weight: 1.24 }
      ],
      [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop', is_primary: true, sort_order: 1 }
      ]
    );

    // 2.2 Dell XPS 13
    await createProductWithDetails(
      {
        name: 'Dell XPS 13 Plus 9320',
        slug: 'dell-xps-13-plus-9320',
        sku: 'DELLXPS13',
        description: 'Kiệt tác Ultrabook chạy Windows tốt nhất thế giới với màn hình vô cực OLED, bàn phím tràn viền tàng hình đột phá và hiệu năng Core i7 mạnh mẽ.',
        product_img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop',
        brand: 'Dell',
        category_id: catMap['laptop'],
        is_active: true
      },
      [
        { variant_sku: 'DELLXPS13-I7', color: 'Bạc', size: '16GB/512GB', price: 38990000, compare_price: 43990000, weight: 1.26 }
      ],
      [
        { url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop', is_primary: true, sort_order: 1 }
      ]
    );

    // 3.1 iPad Pro M2
    await createProductWithDetails(
      {
        name: 'iPad Pro 11 inch M2 Wifi',
        slug: 'ipad-pro-11-inch-m2-wifi',
        sku: 'IPADPROM2',
        description: 'Sức mạnh cực đại từ chip M2, màn hình Liquid Retina tuyệt đẹp, khả năng quay video ProRes chuyên nghiệp kết hợp cùng Apple Pencil hover.',
        product_img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop',
        brand: 'Apple',
        category_id: catMap['tablet'],
        is_active: true
      },
      [
        { variant_sku: 'IPADPROM2-128', color: 'Xám', size: '128GB', price: 20490000, compare_price: 23990000, weight: 0.47 },
        { variant_sku: 'IPADPROM2-256', color: 'Bạc', size: '256GB', price: 22990000, compare_price: 26990000, weight: 0.47 }
      ],
      [
        { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop', is_primary: true, sort_order: 1 }
      ]
    );

    // 4.1 AirPods Pro 2
    await createProductWithDetails(
      {
        name: 'Tai nghe Bluetooth Apple AirPods Pro 2 USB-C',
        slug: 'airpods-pro-2-usb-c',
        sku: 'AIRPODSPRO2',
        description: 'Chống ồn chủ động ANC hiệu quả gấp 2 lần, tính năng Nhận biết cuộc hội thoại thông minh và hộp sạc MagSafe trang bị loa tìm kiếm tiện lợi.',
        product_img: 'https://images.unsplash.com/photo-1588449668338-d1347b11a53a?q=80&w=600&auto=format&fit=crop',
        brand: 'Apple',
        category_id: catMap['headphone'],
        is_active: true
      },
      [
        { variant_sku: 'AIRPODSPRO2-USBC', color: 'Trắng', size: 'Tiêu chuẩn', price: 5490000, compare_price: 6190000, weight: 0.05 }
      ],
      [
        { url: 'https://images.unsplash.com/photo-1588449668338-d1347b11a53a?q=80&w=600&auto=format&fit=crop', is_primary: true, sort_order: 1 }
      ]
    );

    // 5.1 Củ sạc nhanh Anker 65W
    await createProductWithDetails(
      {
        name: 'Củ sạc nhanh Anker Prime 3 cổng 67W',
        slug: 'anker-prime-67w-3-ports',
        sku: 'ANKER67W',
        description: 'Sạc nhanh đồng thời 3 thiết bị với công suất tối đa 67W cực nhỏ gọn nhờ công nghệ GaN thế hệ mới nhất của Anker.',
        product_img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop',
        brand: 'Anker',
        category_id: catMap['accessories'],
        is_active: true
      },
      [
        { variant_sku: 'ANKER67W-BLACK', color: 'Đen', size: '67W', price: 950000, compare_price: 1200000, weight: 0.12 }
      ],
      [
        { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop', is_primary: true, sort_order: 1 }
      ]
    );


    console.log('Seeding Vouchers...');
    // Seed Vouchers
    const now = new Date();
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    await Voucher.create([
      {
        code: 'SALE20',
        name: 'Giảm giá 20%',
        description: 'Giảm giá 20% cho đơn hàng từ 500k',
        discount_type: 'percentage',
        discount_value: 20,
        min_order_amount: 500000,
        max_discount: 200000,
        usage_limit: 100,
        valid_from: now,
        valid_until: oneYearLater,
        is_active: true
      },
      {
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển',
        description: 'Miễn phí vận chuyển cho đơn hàng từ 1 triệu',
        discount_type: 'fixed',
        discount_value: 50000,
        min_order_amount: 1000000,
        max_discount: 50000,
        usage_limit: 200,
        valid_from: now,
        valid_until: oneYearLater,
        is_active: true
      },
      {
        code: 'NEWUSER',
        name: 'Giảm giá cho khách mới',
        description: 'Giảm giá 15% cho khách hàng mới',
        discount_type: 'percentage',
        discount_value: 15,
        min_order_amount: 200000,
        max_discount: 100000,
        usage_limit: 500,
        valid_from: now,
        valid_until: oneYearLater,
        is_active: true
      }
    ]);

    console.log('Seed Database completed successfully!');
  } catch (error) {
    console.error('Error seeding products and categories:', error);
  }
};

// Đăng ký seed chạy một lần khi DB kết nối thành công
mongoose.connection.once('open', seedProductsAndCategories);
