import { Property } from "../model/properties.js";

// Array of default house images to use when image is empty
const defaultHouseImages = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126",
  "https://images.unsplash.com/photo-1598228723793-52759bba239c",
];

// Function to get a random default house image
const getRandomHouseImage = () => {
  const randomIndex = Math.floor(Math.random() * defaultHouseImages.length);
  return defaultHouseImages[randomIndex];
};

// Function to ensure property has an image
const ensurePropertyImage = (property) => {
  if (!property.image || property.image === "") {
    property.image = getRandomHouseImage();
  }
  return property;
};

// ✅ GET PROPERTIES BY CLERK NAME
export const getPropertiesByClerkName = async (req, res) => {
  try {
    const { clerkName } = req.params;

    if (!clerkName) {
      return res.status(400).json({ message: "Clerk name is required" });
    }

    const properties = await Property.find({
      propertyDealerName: { $regex: clerkName, $options: "i" },
    });

    const formattedProperties = properties.map((property) => {
      // Ensure property has an image
      const propertyWithImage = ensurePropertyImage({ ...property.toObject() });

      return {
        _id: property._id,
        Area: property.Area,
        areaUnit: property.areaUnit,
        TotalArea: property.TotalArea,
        description: property.description,
        image: propertyWithImage.image,
        images: property.images,
        video: property.video,
        price: property.price,
        priceUnit: property.priceUnit,
        location: property.location,
        category: property.category,
        beds: property.beds,
        Bath: property.Bath,
        title: property.title, // ✅ Added title
        city: property.city,
        timeRequirement: property.timeRequirement,
        minPrice: property.minPrice,
        maxPrice: property.maxPrice,
        buyOrRent: property.buyOrRent,
        senderName: property.senderName,
        portionCategory: property.portionCategory,
        propertyDealerName: property.propertyDealerName,
        propertyDealerEmail: property.propertyDealerEmail,
        phone: property.phone,
        createdAt: property.createdAt?.toISOString(),
        updatedAt: property.updatedAt?.toISOString(),
      };
    });

    res.json({
      message: "Properties fetched successfully by clerk name",
      data: formattedProperties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching properties by clerk name",
    });
  }
};

// ✅ GET ALL PROPERTIES
export const getProperties = async (req, res) => {
  try {
    let query = {};

    if (req.query.senderName) {
      query.senderName = { $regex: req.query.senderName, $options: "i" };
    }

    const properties = await Property.find(query);

    const formattedProperties = properties.map((property) => {
      const propertyWithImage = ensurePropertyImage({ ...property.toObject() });

      return {
        _id: property._id,
        Area: property.Area,
        areaUnit: property.areaUnit,
        TotalArea: property.TotalArea,
        description: property.description,
        image: propertyWithImage.image,
        images: property.images,
        video: property.video,
        price: property.price,
        title: property.title,
        priceUnit: property.priceUnit,
        location: property.location,
        category: property.category,
        beds: property.beds,
        status: property.status,
        Bath: property.Bath,
        city: property.city,
        timeRequirement: property.timeRequirement,
        minPrice: property.minPrice,
        maxPrice: property.maxPrice,
        buyOrRent: property.buyOrRent,
        senderName: property.senderName,
        portionCategory: property.portionCategory,
        propertyDealerName: property.propertyDealerName,
        propertyDealerEmail: property.propertyDealerEmail,
        phone: property.phone,
        createdAt: property.createdAt?.toISOString(),
        updatedAt: property.updatedAt?.toISOString(),
      };
    });

    // Response bhejo
    res.json({
      message: "Properties fetched successfully",
      data: formattedProperties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching properties",
    });
  }
};

// ✅ GET PROPERTY BY ID
export const getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Ensure property has an image
    const propertyWithImage = ensurePropertyImage({ ...property.toObject() });

    const formattedProperty = {
      _id: property._id,
      Area: property.Area,
      areaUnit: property.areaUnit,
      TotalArea: property.TotalArea,
      description: property.description,
      image: propertyWithImage.image,
      images: property.images,
      video: property.video,
      title: property.title,
      price: property.price,
      priceUnit: property.priceUnit,
      location: property.location,
      category: property.category,
      beds: property.beds,
      Bath: property.Bath,
      status: property.status,
      city: property.city,
      timeRequirement: property.timeRequirement,
      minPrice: property.minPrice,
      maxPrice: property.maxPrice,
      buyOrRent: property.buyOrRent,
      senderName: property.senderName,
      portionCategory: property.portionCategory,
      propertyDealerName: property.propertyDealerName,
      propertyDealerEmail: property.propertyDealerEmail,
      phone: property.phone, // ✅ phone added
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString(),
    };

    res.json({
      message: "Property fetched successfully",
      data: formattedProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching property by ID",
    });
  }
};

export const createProperty = async (req, res) => {
  try {
    let images = [];
    if (req.files?.images) {
      images = req.files.images.map((file) => `/uploads/${file.filename}`);
    }

    let video = "";
    if (req.files?.video) {
      video = `/uploads/${req.files.video[0].filename}`;
    }
    const newProperty = await Property.create({
      ...req.body,
      phone: req.body.phone || "",
      title: req.body.title || "",
      senderName: req.body.senderName || "",
      status: req.body.status || "public", // Add status with default
      image: images[0] || getRandomHouseImage(),
      images: images,
      video: video,
      minPrice: req.body.minPrice || "",
      maxPrice: req.body.maxPrice || "",
      portionCategory: req.body.portionCategory || "",
    });

    res.status(201).json({
      message: "Property created successfully",
      data: newProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE PROPERTY
export const deleteProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProperty = await Property.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Ensure property has an image
    const propertyWithImage = ensurePropertyImage({
      ...deletedProperty.toObject(),
    });

    const formattedProperty = {
      _id: deletedProperty._id,
      title: deletedProperty.title,
      Area: deletedProperty.Area,
      areaUnit: deletedProperty.areaUnit,
      TotalArea: deletedProperty.TotalArea,
      description: deletedProperty.description,
      image: propertyWithImage.image,
      images: deletedProperty.images,
      video: deletedProperty.video,
      price: deletedProperty.price,
      priceUnit: deletedProperty.priceUnit,
      location: deletedProperty.location,
      category: deletedProperty.category,
      beds: deletedProperty.beds,
      Bath: deletedProperty.Bath,
      city: deletedProperty.city,
      timeRequirement: deletedProperty.timeRequirement,
      minPrice: deletedProperty.minPrice,
      maxPrice: deletedProperty.maxPrice,
      buyOrRent: deletedProperty.buyOrRent,
      senderName: deletedProperty.senderName,
      portionCategory: deletedProperty.portionCategory,
      propertyDealerName: deletedProperty.propertyDealerName,
      propertyDealerEmail: deletedProperty.propertyDealerEmail,
      phone: deletedProperty.phone, // ✅ phone included
      createdAt: deletedProperty.createdAt?.toISOString(),
      updatedAt: deletedProperty.updatedAt?.toISOString(),
      status: deleteProperty.status,
    };

    res.json({
      message: "Property deleted successfully",
      data: formattedProperty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while deleting property",
    });
  }
};

// ✅ UPDATE PROPERTY
export const updateProperty = async (req, res) => {
  const { id } = req.params;

  const updateData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    priceUnit: req.body.priceUnit,
    location: req.body.location,
    category: req.body.category,
    beds: req.body.beds,
    Bath: req.body.Bath,
    city: req.body.city,
    minPrice: req.body.minPrice,
    maxPrice: req.body.maxPrice,
    timeRequirement: req.body.timeRequirement,
    buyOrRent: req.body.buyOrRent,
    senderName: req.body.senderName,
    propertyDealerName: req.body.propertyDealerName,
    propertyDealerEmail: req.body.propertyDealerEmail,
    phone: req.body.phone,
    Area: req.body.Area,
    areaUnit: req.body.areaUnit,
    portionCategory: req.body.portionCategory,
    status: req.body.status,
  };
};
