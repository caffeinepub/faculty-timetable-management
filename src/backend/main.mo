import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Timer "mo:core/Timer";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Option "mo:core/Option";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Custom role type for Teacher vs Checker distinction
  public type AppRole = {
    #admin;
    #teacher;
    #checker;
  };

  public type UserProfile = {
    principal : Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : AppRole;
    qualifications : Text;
    approvalStatus : Text;
    createdAt : Time.Time;
  };

  module Teacher {
    public type TeacherRequest = {
      name : Text;
      email : Text;
      passwordHash : Text;
      role : AppRole;
      phone : Text;
      qualifications : Text;
      photo : ?Storage.ExternalBlob;
      isApproved : Bool;
    };

    public type Teacher = {
      principal : ?Principal;
      name : Text;
      email : Text;
      passwordHash : Text;
      role : AppRole;
      phone : Text;
      qualifications : Text;
      photo : ?Storage.ExternalBlob;
    };

    public func compare(teacher1 : Teacher, teacher2 : Teacher) : Order.Order {
      switch (Text.compare(teacher1.name, teacher2.name)) {
        case (#equal) { Text.compare(teacher1.email, teacher2.email) };
        case (order) { order };
      };
    };

    public func fromRequest(req : TeacherRequest) : Teacher {
      {
        principal = null;
        name = req.name;
        email = req.email;
        passwordHash = req.passwordHash;
        role = req.role;
        phone = req.phone;
        qualifications = req.qualifications;
        photo = req.photo;
      };
    };
  };

  module Subject {
    public type Subject = {
      code : Text;
      name : Text;
      subjectType : Text;
      semesterId : Nat;
      creditHours : Nat;
    };

    public func compare(subject1 : Subject, subject2 : Subject) : Order.Order {
      Text.compare(subject1.code, subject2.code);
    };
  };

  module Room {
    public type Room = {
      name : Text;
      capacity : Nat;
      roomType : Text;
      isActive : Bool;
    };

    public func compare(room1 : Room, room2 : Room) : Order.Order {
      Text.compare(room1.name, room2.name);
    };
  };

  module Batch {
    public type Batch = {
      name : Text;
      semesterId : Nat;
      parentBatchId : ?Nat;
      strength : Nat;
    };

    public func compare(batch1 : Batch, batch2 : Batch) : Order.Order {
      Text.compare(batch1.name, batch2.name);
    };
  };

  module TimetableEntry {
    public type TimetableEntry = {
      subjectId : Nat;
      teacherId : Nat;
      roomId : Nat;
      batchId : Nat;
      day : Nat;
      startTime : Nat;
      endTime : Nat;
      weekType : Text;
    };

    public func compare(entry1 : TimetableEntry, entry2 : TimetableEntry) : Order.Order {
      Text.compare(entry1.weekType, entry2.weekType);
    };
  };

  module Bill {
    public type BillId = Nat;

    public type DailyClassBill = {
      teacherId : Nat;
      date : Time.Time;
      subjectId : Nat;
      batchId : Nat;
      hoursTaught : Float;
      billStatus : Text;
      ratePerHour : Float;
      checkerComment : ?Text;
      adminComment : ?Text;
      amount : Float;
    };

    public func compareByStatus(bill1 : DailyClassBill, bill2 : DailyClassBill) : Order.Order {
      Text.compare(bill1.billStatus, bill2.billStatus);
    };
  };

  module BankDetails {
    public type BankDetailsId = Nat;

    public type BankDetails = {
      teacherId : Nat;
      bankName : Text;
      branch : Text;
      ifscCode : Text;
      accountNumber : Text;
      mobileNumber : Text;
      panNumber : Text;
      email : Text;
      address : Text;
      createdAt : Time.Time;
    };

    public func compareByCreateTime(bankDetails1 : BankDetails, bankDetails2 : BankDetails) : Order.Order {
      Int.compare(bankDetails1.createdAt, bankDetails2.createdAt);
    };
  };

  module Notification {
    public type Notification = {
      title : Text;
      titleHindi : Text;
      body : Text;
      bodyHindi : Text;
      senderId : Nat;
      recipientId : ?Nat;
      createdAt : Time.Time;
      isGlobal : Bool;
    };

    public type NotificationRead = {
      notificationId : Nat;
      userId : Nat;
      isRead : Bool;
      readAt : ?Time.Time;
    };

    public func compare(notification1 : Notification, notification2 : Notification) : Order.Order {
      Int.compare(notification1.createdAt, notification2.createdAt);
    };
  };

  module TeacherDocument {
    public type DocumentId = Nat;

    public type TeacherDocument = {
      teacherId : Nat;
      docType : Text;
      blobKey : Text;
      filename : Text;
      uploadedAt : Time.Time;
      status : Text;
      adminComment : ?Text;
    };

    public func compare(doc1 : TeacherDocument, doc2 : TeacherDocument) : Order.Order {
      Text.compare(doc1.docType, doc2.docType);
    };
  };

  module MonthlyEarningLimit {
    public type MonthlyEarningLimitId = Nat;

    public type MonthlyEarningLimit = {
      teacherId : Nat;
      month : Nat;
      year : Nat;
      monthlyLimit : Float;
      yearlyLimit : Float;
    };

    public type MonthlyEarning = {
      teacherId : Nat;
      month : Nat;
      year : Nat;
      amount : Float;
      hours : Float;
    };

    public func compare(earning1 : MonthlyEarning, earning2 : MonthlyEarning) : Order.Order {
      Int.compare(earning1.month, earning2.month);
    };

    public func compareByTeacher(earning1 : MonthlyEarning, earning2 : MonthlyEarning) : Order.Order {
      Int.compare(earning1.teacherId, earning2.teacherId);
    };
  };

  module Documents {
    public type DocumentReference = {
      teacherId : Nat;
      docType : Text;
      blob : Storage.ExternalBlob;
      filename : Text;
      uploadedAt : Time.Time;
      status : Text;
      adminComment : ?Text;
    };

    public func compare(doc1 : DocumentReference, doc2 : DocumentReference) : Order.Order {
      Text.compare(doc1.docType, doc2.docType);
    };
  };

  module Semester {
    public type Semester = {
      name : Text;
      program : Text;
      year : Nat;
      isActive : Bool;
    };

    public func compare(sem1 : Semester, sem2 : Semester) : Order.Order {
      Text.compare(sem1.name, sem2.name);
    };
  };

  module TeacherId {
    public func compare(id1 : Nat, id2 : Nat) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module BillId {
    public func compare(id1 : Bill.BillId, id2 : Bill.BillId) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module DocumentId {
    public func compare(id1 : TeacherDocument.DocumentId, id2 : TeacherDocument.DocumentId) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module BankDetailsId {
    public func compare(id1 : BankDetails.BankDetailsId, id2 : BankDetails.BankDetailsId) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module NotificationId {
    public func compare(id1 : Nat, id2 : Nat) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module BatchId {
    public func compare(id1 : Nat, id2 : Nat) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module RoomId {
    public func compare(id1 : Nat, id2 : Nat) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module SubjectId {
    public func compare(id1 : Nat, id2 : Nat) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module TimetableId {
    public func compare(id1 : Nat, id2 : Nat) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module SemesterId {
    public func compare(id1 : Nat, id2 : Nat) : Order.Order {
      Nat.compare(id1, id2);
    };
  };

  module Document {
    public func getTeacherId(doc : TeacherDocument.TeacherDocument) : Nat {
      doc.teacherId;
    };
  };

  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userApprovalState = UserApproval.initState(accessControlState);

  // Approval-based user management
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(userApprovalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(userApprovalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(userApprovalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(userApprovalState);
  };

  // Register a new user profile - authenticated users only, cannot self-assign admin role
  public shared ({ caller }) func registerUser(name : Text, email : Text, phone : Text, role : AppRole, qualifications : Text) : async UserProfile {
    // Require at least user-level authentication (not anonymous/guest)
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };

    // Prevent self-registration as admin - only admins can create admin accounts
    if (role == #admin and not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create admin accounts");
    };

    // Check if user already has a profile
    switch (userProfiles.get(caller)) {
      case (?existing) {
        Runtime.trap("User profile already exists for this principal");
      };
      case null {
        let profile : UserProfile = {
          principal = caller;
          name;
          email;
          phone;
          role;
          qualifications;
          approvalStatus = "pending";
          createdAt = Time.now();
        };
        userProfiles.add(caller, profile);
        profile;
      };
    };
  };

  // Get the caller's user profile - authenticated users only
  public query ({ caller }) func getUserProfile() : async ?UserProfile {
    // Require at least user-level authentication (not anonymous/guest)
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  // List all user profiles - admin only
  public query ({ caller }) func listAllUsers() : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    userProfiles.values().toArray();
  };

  // Admin can create users with any role
  public shared ({ caller }) func adminCreateUser(principal : Principal, name : Text, email : Text, phone : Text, role : AppRole, qualifications : Text) : async UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    // Check if user already has a profile
    switch (userProfiles.get(principal)) {
      case (?existing) {
        Runtime.trap("User profile already exists for principal: " # principal.toText());
      };
      case null {
        let profile : UserProfile = {
          principal;
          name;
          email;
          phone;
          role;
          qualifications;
          approvalStatus = "approved";
          createdAt = Time.now();
        };
        userProfiles.add(principal, profile);
        profile;
      };
    };
  };

  // Admin can delete a user - with protection against deleting admin accounts
  public shared ({ caller }) func adminDeleteUser(principal : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let profile = userProfiles.get(principal);
    switch (profile) {
      case null {
        Runtime.trap("User with this principal not found: " # principal.toText());
      };
      case (?profile) {
        // Prevent deletion of admin accounts for safety
        if (profile.role == #admin) {
          Runtime.trap("Cannot delete an admin user");
        };
        userProfiles.remove(principal);
      };
    };
  };
};
