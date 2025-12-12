import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@repo/db';
import type { auth } from "../auth"
// Validation schema matching the frontend form
const createLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  village: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().default("India"),
});

const updateLocationSchema = createLocationSchema.partial();

const LocationController = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    userId: string;
  }
}>()
  // Get location by user ID (from context)
  .get('/', async (c) => {
    try {
      const userId = c.get('userId');
      console.log("userId", userId);

      if (!userId) {
        return c.json({
          success: false,
          error: 'User ID is required'
        }, 400);
      }

      const location = await prisma.location.findUnique({
        where: { userId },
        select: {
          latitude: true,
          longitude: true,
          address: true,
          village: true,
          city: true,
          state: true,
          district: true,
          pincode: true,
          country: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });
      console.log("location is this", location);
      if (!location) {
        return c.json({
          success: false,
          error: 'Location not found for this user'
        }, 404);
      }

      return c.json({
        success: true,
        data: location
      });

    } catch (error) {
      console.error('Error fetching location:', error);
      return c.json({
        success: false,
        error: 'Failed to fetch location',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  })

  // Create or update location for a user
  .post('/', zValidator('json', createLocationSchema), async (c) => {
    try {
      console.log("locaiton  endpoint is called")
      const data = c.req.valid('json');
      const userId = c.get('userId');

      console.log("data from post endpoint", data)
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return c.json({
          success: false,
          error: 'User not found'
        }, 404);
      }

      // Check if location already exists for this user
      const existingLocation = await prisma.location.findUnique({
        where: { userId: userId }
      });

      let location;

      if (existingLocation) {
        // Update existing location
        location = await prisma.location.update({
          where: { userId: userId },
          data: {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            village: data.village,
            city: data.city,
            state: data.state,
            district: data.district,
            pincode: data.pincode,
            country: data.country,
          }
        });
      } else {
        // Create new location
        location = await prisma.location.create({
          data: {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            village: data.village,
            city: data.city,
            state: data.state,
            district: data.district,
            pincode: data.pincode,
            country: data.country,
            userId: userId,
          }
        });
      }

      return c.json({
        success: true,
        data: location,
        message: existingLocation ? 'Location updated successfully' : 'Location created successfully'
      }, existingLocation ? 200 : 201);

    } catch (error) {
      console.error('Error creating/updating location:', error);
      return c.json({
        success: false,
        error: 'Failed to save location',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  })

  // Update location (PATCH)
  .patch('/', zValidator('json', updateLocationSchema), async (c) => {
    try {
      const userId = c.get('userId');
      const data = c.req.valid('json');

      // Check if location exists
      const existingLocation = await prisma.location.findUnique({
        where: { userId }
      });

      if (!existingLocation) {
        return c.json({
          success: false,
          error: 'Location not found for this user'
        }, 404);
      }

      // Update location with partial data
      const location = await prisma.location.update({
        where: { userId },
        data: {
          ...(data.latitude !== undefined && { latitude: data.latitude }),
          ...(data.longitude !== undefined && { longitude: data.longitude }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.village !== undefined && { village: data.village }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.district !== undefined && { district: data.district }),
          ...(data.pincode !== undefined && { pincode: data.pincode }),
          ...(data.country !== undefined && { country: data.country }),
        }
      });

      return c.json({
        success: true,
        data: location,
        message: 'Location updated successfully'
      });

    } catch (error) {
      console.error('Error updating location:', error);
      return c.json({
        success: false,
        error: 'Failed to update location',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  })

  // Delete location
  .delete('/', async (c) => {
    try {
      const userId = c.get('userId');

      // Check if location exists
      const existingLocation = await prisma.location.findUnique({
        where: { userId }
      });

      if (!existingLocation) {
        return c.json({
          success: false,
          error: 'Location not found for this user'
        }, 404);
      }

      // Delete location
      await prisma.location.delete({
        where: { userId }
      });

      return c.json({
        success: true,
        message: 'Location deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting location:', error);
      return c.json({
        success: false,
        error: 'Failed to delete location',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  })

  // Get all locations (for admin or map view)
  .get('/all', async (c) => {
    try {
      const locations = await prisma.location.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return c.json({
        success: true,
        data: locations,
        count: locations.length
      });

    } catch (error) {
      console.error('Error fetching locations:', error);
      return c.json({
        success: false,
        error: 'Failed to fetch locations',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  });

export default LocationController;
