package com.diplomates.firesafe.data.repository;

import android.content.Context;
import android.content.SharedPreferences;

import com.diplomates.firesafe.data.model.EmergencyContact;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages persistent storage and retrieval of emergency contacts for SOS and SMS dispatch.
 */
public class EmergencyContactsManager {

    private static final String PREF_NAME = "firesafe_emergency_contacts";
    private static final String KEY_CONTACTS_JSON = "contacts_list_json";

    private static EmergencyContactsManager instance;
    private final SharedPreferences prefs;

    private EmergencyContactsManager(Context context) {
        this.prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized EmergencyContactsManager getInstance(Context context) {
        if (instance == null) {
            instance = new EmergencyContactsManager(context);
        }
        return instance;
    }

    public List<EmergencyContact> getContacts() {
        String jsonStr = prefs.getString(KEY_CONTACTS_JSON, null);
        List<EmergencyContact> contacts = new ArrayList<>();
        boolean purgedDummy = false;

        if (jsonStr != null && !jsonStr.trim().isEmpty()) {
            try {
                JSONArray arr = new JSONArray(jsonStr);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject obj = arr.getJSONObject(i);
                    EmergencyContact ec = EmergencyContact.fromJsonObject(obj);
                    if (ec != null && !isDummyPlaceholder(ec)) {
                        contacts.add(ec);
                    } else {
                        purgedDummy = true;
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (purgedDummy) {
            saveContacts(contacts);
        }

        return contacts;
    }

    private boolean isDummyPlaceholder(EmergencyContact contact) {
        if (contact == null) return true;
        String name = contact.getName() != null ? contact.getName().toLowerCase(java.util.Locale.ROOT).trim() : "";
        String phone = contact.getPhoneNumber() != null ? contact.getPhoneNumber().trim() : "";
        return name.contains("sunita") || name.contains("rahul")
                || name.contains("control room") || name.contains("dummy") || name.contains("placeholder")
                || name.contains("sample") || name.contains("test contact")
                || phone.equals("+919822012345") || phone.equals("+919823167890") || phone.equals("101")
                || phone.equals("112") || phone.equals("0000000000") || phone.isEmpty();
    }

    public void addContact(EmergencyContact contact) {
        List<EmergencyContact> contacts = getContacts();
        contacts.add(contact);
        saveContacts(contacts);
    }

    public void removeContact(String contactId) {
        List<EmergencyContact> contacts = getContacts();
        for (int i = 0; i < contacts.size(); i++) {
            if (contacts.get(i).getId().equals(contactId)) {
                contacts.remove(i);
                break;
            }
        }
        saveContacts(contacts);
    }

    public void saveContacts(List<EmergencyContact> contacts) {
        try {
            JSONArray arr = new JSONArray();
            for (EmergencyContact c : contacts) {
                arr.put(c.toJsonObject());
            }
            prefs.edit().putString(KEY_CONTACTS_JSON, arr.toString()).apply();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
