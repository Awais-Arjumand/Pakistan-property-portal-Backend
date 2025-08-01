// model/companyproperties.js
import mongoose, { Schema } from "mongoose";

const CompanyPropertySchema = new Schema(
  {
    title: { type: String }, 
    Area: { type: String },
    areaUnit: { type: String },
    TotalArea: { type: String },
    description: { type: String },
    image: { type: String },
    images: [{ type: String }],
    video: { type: String },
    price: { type: String },
    priceUnit: { type: String },
    minPrice: { type: String },
    maxPrice: { type: String },
    portionCategory: { type: String },
    location: { type: String },
    category: { type: String },
    beds: { type: Number },
    Bath: { type: Number },
    city: { type: String },
    status: { 
      type: String,
      enum: ['public', 'private', 'company-website'],
      default: 'company-website'
    },
    buyOrRent: { type: String },
    timeRequirement: { type: String },
    senderName: { 
      type: String,
      set: function(name) {
        if (!name) return name;
        return name.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    },
    propertyDealerName: {
      type: String,
      validate: {
        validator: function (v) {
          return v.trim().split(/\s+/).length >= 2;
        },
        message: (props) =>
          `${props.value} should be a full name (at least first and last name)`,
      },
    },
    propertyDealerEmail: {
      type: String,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    phone: { type: String },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' }
  },
  { timestamps: true }
);

export const CompanyProperty = mongoose.model("CompanyProperty", CompanyPropertySchema);