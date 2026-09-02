import { z } from 'zod';

export const requestDeliverySchema = z.object({
  quoteId: z
    .string({ message: 'Quote ID is required' })
    .uuid('Invalid Quote ID'),
  method: z.enum(['deliver to site', 'pickup at yard'], {
    message: 'Method is required',
  }),
  deliveryAddress: z.string({ message: 'Delivery Address is required' }),
  preferredDay: z.string({ message: 'Preferred Day is required' }).datetime(),
  timeWindow: z.enum(['morning', 'afternoon'], {
    message: 'Time Window is required',
  }),
  dropZoneNotes: z
    .string({ message: 'Drop Zone Notes must be a string' })
    .nullable()
    .optional(),
  urgent: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.toLowerCase() === 'true' : val),
      z.boolean({ message: 'Urgent must be a boolean' }).nullable().optional(),
    )
    .default(false),
  dropZonePhotos: z
    .array(z.string({ message: 'Dropzone photo URLs must be strings' }), {
      message: 'Dropzone photos must be an array',
    })
    .max(5, { message: 'Cannot upload more than 5 images' })
    .nullable()
    .optional(),
});

export const markDeliveredSchema = z.object({
  scheduledAt: z
    .string({ message: 'Scheduled At must be a string' })
    .datetime({ message: 'Invalid datetime format for Scheduled At' })
    .nullable()
    .optional(),
  outForDeliveryAt: z
    .string({ message: 'Out for Delivery At must be a string' })
    .datetime({ message: 'Invalid datetime format for Out for Delivery At' })
    .nullable()
    .optional(),
  deliveredAt: z
    .string({ message: 'Delivered At must be a string' })
    .datetime({ message: 'Invalid datetime format for Delivered At' })
    .nullable()
    .optional(),
  proofOfDeliveryPhotos: z
    .array(
      z.string({ message: 'Proof of Delivery photo URLs must be strings' }),
      { message: 'Proof of Delivery photos must be an array' },
    )
    .max(5, { message: 'Cannot upload more than 5 images' })
    .nullable()
    .optional(),
});

export type RequestDeliveryPayload = z.infer<typeof requestDeliverySchema>;
export type MarkDeliveredPayload = z.infer<typeof markDeliveredSchema>;
