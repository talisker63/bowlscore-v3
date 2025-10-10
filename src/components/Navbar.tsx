@@ .. @@
 import { Menu, X, User, LogOut, Settings } from 'lucide-react';
 import { useAuth } from '../contexts/AuthContext';
+import SubscriptionStatus from './SubscriptionStatus';
 
@@ .. @@
           <div className="flex items-center space-x-8">
             <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
               Home
             </Link>
+            <Link to="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
+              Pricing
+            </Link>
             <Link to="/drills" className="text-gray-700 hover:text-blue-600 transition-colors">
@@ .. @@
           {user ? (
             <div className="flex items-center space-x-4">
+              <SubscriptionStatus />
               <div className="relative">
@@ .. @@
                 <div className="py-1">
                   <div className="px-4 py-2 text-sm text-gray-700 border-b">
                     {user.email}
+                    <div className="mt-1">
+                      <SubscriptionStatus />
+                    </div>
                   </div>
@@ .. @@
             <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
               Home
             </Link>
+            <Link to="/pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
+              Pricing
+            </Link>
             <Link to="/drills" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
@@ .. @@
             {user && (
               <div className="border-t pt-4">
                 <div className="px-3 py-2 text-sm text-gray-600">
                   {user.email}
+                  <div className="mt-1">
+                    <SubscriptionStatus />
+                  </div>
                 </div>
@@ .. @@
             )
             }
           )
           }