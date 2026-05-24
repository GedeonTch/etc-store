import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { validerNom, validerEmail, validerMotDePasse, validerTelephone, validerFichierImage } from "@/lib/utils";

