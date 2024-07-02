<%@ Page Title="Admin" Language="C#" MasterPageFile="~/Site1.Master" AutoEventWireup="true" CodeBehind="Admin.aspx.cs" Inherits="SezwanPayroll.Admin" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="container mt-5">

        <!-- Add Client Section -->

          <div class="card mb-4">
      <div class="card-header d-flex justify-content-between">
          <h5 class="mb-0">Add A Client <i class="fas fa-user-plus"></i></h5>
          <i class="fas fa-minus" id="minimiseAddUser"></i>
      </div>
      <div class="card-body add-user">
          <form id="clientForm">
              <div class="form-group mb-3">
                  <label for="username" class="form-label">Client Name</label>
                  <input type="text" class="form-control" id="clientUsername" name="username">
              </div>
              <div class="form-group mb-3">
                  <label for="password" class="form-label">Address</label>
                  <input type="password" class="form-control" id="clientPass" name="password">
              </div>
              <div class='form-group mb-3'>
              <label for="FullName" class="form-label">Contact Information</label>
              <input type="text" class="form-control" id="FullName">
          </div>
          <div class=form-group mb-3> <!-- This is for the Permission Names -->
              <label for="BrnNo" class="form-label">BRN Number</label>
            <input type="text" class="form-control" id="BrnNo"/>
          </div>
             
              <button type="button" class="btn btn-success" id="clientSubmit">Create Client</button>
          </form>
      </div>
  </div>
        <!-- Add User Section -->
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between">
                <h5 class="mb-0">Add A User <i class="fas fa-user-plus"></i></h5>
                <i class="fas fa-minus" id="minimiseAddUser"></i>
            </div>
            <div class="card-body add-user">
                <form id="registrationForm">
                    <div class="form-group mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username" name="username">
                    </div>
                    <div class="form-group mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" name="password">
                    </div>
                    <div class='form-group mb-3'>
                    <label for="FullName" class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="FullName">
                </div>
                <div class=form-group mb-3> <!-- This is for the Permission Names -->
                    <label for="permissionNames" class="form-label">Permission Names</label>
                  <input type="text" class="form-control" id="permissionNames"/>
                </div>
                    <div class="form-check mb-3">
                        <input type="checkbox" class="form-check-input" id="isAdmin" name="admin">
                        <label class="form-check-label" for="isAdmin">Is an Admin</label>
                    </div>
                    <button type="button" class="btn btn-success" id="submitBtn">Create An Account</button>
                </form>
            </div>
        </div>

        <!-- View Users Section -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Edit Users <i class="fas fa-users"></i></h5>
            </div>
            <div class="card-body">
                <div class="form-group mb-3">
                    <select class="form-select" id="userSelect">
                        <option disabled selected>Select User</option>
                    </select>
                    <input type="hidden" id="hiddenPermissionNames" />
                    <input type="hidden" id="hiddenUserId" />
                </div>
            </div>
        </div>

        <!-- Edit User Section -->
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between">
                <h5 class="mb-0">Edit User Details <i class="fas fa-user-edit"></i></h5>
                <!-- we need to add a minimise ability now -->
               <i class="fas fa-minus" id="minimiseUserDetails"></i>
               </div>
            <div class="card-body clsUserDetails">
                <div class="form-group mb-3 mt-4">
                    <label for="usernameChange" class="form-label">Username</label>
                    <input type="text" class="form-control" id="usernameChange" placeholder="Enter username">
                </div>
                <div class="form-group mb-3">
                    <label for="passwordChange" class="form-label">Password</label>
                    <input type="password" class="form-control" id="passwordChange" placeholder="Enter password">
                </div>
                
                <div class="form-group mb-3">
                    <label for="roleId" class="form-label">Role</label>
                    <select class="form-select" id="roleId">
                        <option value="1">User</option>
                        <option value="2">Admin</option>
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label for="fname" class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="fname" placeholder="Enter full name">
                </div>
                <button type="button" class="btn btn-primary" id="editBtn">Edit User</button>
            </div>
        </div>
        

        <!-- View Products Section -->
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between">
                <h5 class="mb-0 ">Edit Products <i class="fas fa-box-open"></i></h5>
                  <i class="fas fa-minus" id="minimizeProductDetails"></i>
            </div>
            <div class="card-body products-details ">
                <form id="productForm">
                    <div class="form-group mb-3">
                        <%-- <label for="productname" class="form-label">Product Name</label> --%>
                        <select class="form-select viewAllProductsDropdown" id="productname">
                            <option disabled selected>Select Product</option>
                        </select>
                       <input type="hidden" id="hiddenProductId" />

                    </div>
                    <div class="form-group mb-3">
                        <label for="productnameValue" class="form-label">Product Name</label>
                        <input type="text" class="form-control" id="productnameValue" name="productname">
                    </div>
                    <div class="form-group mb-3">
                        <label for="unitprice" class="form-label">Unit Price</label>
                        <input type="text" class="form-control" id="unitprice" name="unitprice">
                    </div>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-success" id="updateproductBtn">Save Changes</button>
                        <button type="button" class="btn btn-danger" id="deleteProductBtn">Delete Product</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.11.0/sweetalert2.min.js" integrity="sha512-Wi5Ms24b10EBwWI9JxF03xaAXdwg9nF51qFUDND/Vhibyqbelri3QqLL+cXCgNYGEgokr+GA2zaoYaypaSDHLg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/admin.js"></script>
</asp:Content>
