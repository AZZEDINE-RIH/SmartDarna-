import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // Example: fetch data from a table
  async getData(table: string) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) {
      console.error('Supabase error:', error);
      return [];
    }
    return data;
  }

   // Example: insert data into a table
  async insertData(table: string, payload: any) {
    const { data, error } = await this.supabase.from(table).insert(payload);
    if (error) {
      console.error('Supabase error:', error);
      return null;
    }
    return data;
  }
}