/**
 * Strongly Typed Supabase Database Definitions
 * Corresponds to Migration 00001
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'ADMIN' | 'CUSTOMER';
export type HealthNoteVisibility = 'CUSTOMER_VISIBLE' | 'ADMIN_ONLY';
export type CampStatus = 'UPCOMING' | 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'UPI' | 'RAZORPAY' | 'CASH';
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          role: UserRole;
          full_name: string;
          mobile: string | null;
          email: string | null;
          profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          role?: UserRole;
          full_name: string;
          mobile?: string | null;
          email?: string | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          role?: UserRole;
          full_name?: string;
          mobile?: string | null;
          email?: string | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          id: string;
          business_name: string;
          owner_name: string;
          owner_mobile: string;
          upi_id: string;
          email: string | null;
          address_line: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          operating_hours: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          owner_name?: string;
          owner_mobile?: string;
          upi_id?: string;
          email?: string | null;
          address_line?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          operating_hours?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          owner_name?: string;
          owner_mobile?: string;
          upi_id?: string;
          email?: string | null;
          address_line?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          operating_hours?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_profiles: {
        Row: {
          id: string;
          profile_id: string;
          date_of_birth: string | null;
          gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
          blood_group: string | null;
          emergency_contact: string | null;
          occupation: string | null;
          dietary_preference: string | null;
          lifestyle_activity_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          date_of_birth?: string | null;
          gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
          blood_group?: string | null;
          emergency_contact?: string | null;
          occupation?: string | null;
          dietary_preference?: string | null;
          lifestyle_activity_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          date_of_birth?: string | null;
          gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
          blood_group?: string | null;
          emergency_contact?: string | null;
          occupation?: string | null;
          dietary_preference?: string | null;
          lifestyle_activity_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_measurements: {
        Row: {
          id: string;
          customer_id: string;
          camp_id: string | null;
          measured_at: string;
          height_cm: number;
          weight_kg: number;
          age: number;
          bmi: number;
          body_fat_percent: number | null;
          visceral_fat: number | null;
          muscle_percent: number | null;
          subcutaneous_fat_percent: number | null;
          calories: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          camp_id?: string | null;
          measured_at?: string;
          height_cm: number;
          weight_kg: number;
          age: number;
          bmi: number;
          body_fat_percent?: number | null;
          visceral_fat?: number | null;
          muscle_percent?: number | null;
          subcutaneous_fat_percent?: number | null;
          calories?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          camp_id?: string | null;
          measured_at?: string;
          height_cm?: number;
          weight_kg?: number;
          age?: number;
          bmi?: number;
          body_fat_percent?: number | null;
          visceral_fat?: number | null;
          muscle_percent?: number | null;
          subcutaneous_fat_percent?: number | null;
          calories?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      health_notes: {
        Row: {
          id: string;
          customer_id: string;
          note: string;
          visibility: HealthNoteVisibility;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          note: string;
          visibility?: HealthNoteVisibility;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          note?: string;
          visibility?: HealthNoteVisibility;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      camps: {
        Row: {
          id: string;
          name: string;
          location_name: string;
          address: string;
          date: string;
          start_time: string;
          end_time: string;
          status: CampStatus;
          description: string | null;
          max_registrations: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location_name: string;
          address: string;
          date: string;
          start_time: string;
          end_time: string;
          status?: CampStatus;
          description?: string | null;
          max_registrations?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location_name?: string;
          address?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          status?: CampStatus;
          description?: string | null;
          max_registrations?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      camp_customers: {
        Row: {
          id: string;
          camp_id: string;
          customer_id: string;
          token_number: number | null;
          registered_at: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          camp_id: string;
          customer_id: string;
          token_number?: number | null;
          registered_at?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          camp_id?: string;
          customer_id?: string;
          token_number?: number | null;
          registered_at?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          discounted_price: number | null;
          stock_quantity: number;
          sku: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          discounted_price?: number | null;
          stock_quantity?: number;
          sku?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          discounted_price?: number | null;
          stock_quantity?: number;
          sku?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          recipient_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          recipient_name: string;
          phone: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          recipient_name?: string;
          phone?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          order_number: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          currency: string;
          subtotal: number;
          discount: number;
          shipping_fee: number;
          total_amount: number;
          shipping_address_id: string | null;
          shipping_address_snapshot?: any;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          order_number: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          currency?: string;
          subtotal: number;
          discount?: number;
          shipping_fee?: number;
          total_amount: number;
          shipping_address_id?: string | null;
          shipping_address_snapshot?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          order_number?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          currency?: string;
          subtotal?: number;
          discount?: number;
          shipping_fee?: number;
          total_amount?: number;
          shipping_address_id?: string | null;
          shipping_address_snapshot?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name_snapshot?: string | null;
          sku_snapshot?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name_snapshot?: string | null;
          sku_snapshot?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name_snapshot?: string | null;
          sku_snapshot?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          payment_method: PaymentMethod;
          status: PaymentStatus;
          amount: number;
          currency: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          upi_transaction_ref: string | null;
          paid_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          payment_method?: PaymentMethod;
          status?: PaymentStatus;
          amount: number;
          currency?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          upi_transaction_ref?: string | null;
          paid_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          payment_method?: PaymentMethod;
          status?: PaymentStatus;
          amount?: number;
          currency?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          upi_transaction_ref?: string | null;
          paid_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          customer_id: string;
          title: string;
          report_type: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          generated_at: string;
          generated_by: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          title: string;
          report_type?: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          generated_at?: string;
          generated_by?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          title?: string;
          report_type?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          generated_at?: string;
          generated_by?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_current_profile_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      health_note_visibility: HealthNoteVisibility;
      camp_status: CampStatus;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
